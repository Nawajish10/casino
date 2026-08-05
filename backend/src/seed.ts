import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import axios from 'axios';
import { FALLBACK_PROVIDERS, FALLBACK_GAMES } from './data/games.fallback';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const gatewayUrl = process.env.PROVIDER_GATEWAY_URL || 'https://api.nexusggr.dev';
const agentCode = process.env.PROVIDER_AGENT_CODE || 'test_demo';
const agentToken = process.env.PROVIDER_AGENT_TOKEN || 'dfc648fb5dc5dca8049e5242d26d5216';

function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

async function fetchFromApi(method: string, extraData: Record<string, any> = {}) {
  try {
    const response = await axios.post(
      gatewayUrl,
      {
        method,
        agent_code: agentCode,
        agent_token: agentToken,
        ...extraData,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
        },
        timeout: 8000,
      }
    );
    return response.data;
  } catch (error: any) {
    return null;
  }
}

async function main() {
  console.log('🌱 Starting Fast Batch Sync of Providers & Active Games into Supabase...');

  const providerMap = new Map<string, string>(); // code -> id

  // 1. Fetch Existing Providers from Supabase
  const { data: existingProviders } = await supabase
    .from('Provider')
    .select('id, providerCode');

  if (existingProviders) {
    existingProviders.forEach(p => providerMap.set(p.providerCode.toUpperCase(), p.id));
  }

  // 2. Fetch Active Providers from Provider API
  console.log('\n📡 Step 1: Fetching Active Providers from Provider API...');
  const apiProviderData = await fetchFromApi('provider_list');

  const providerBatch: any[] = [];
  if (apiProviderData && apiProviderData.status === 1 && Array.isArray(apiProviderData.providers)) {
    console.log(`✓ API returned ${apiProviderData.providers.length} total providers.`);
    for (const rawProv of apiProviderData.providers) {
      const code = (rawProv.code || rawProv.provider_code || '').toUpperCase().trim();
      const name = rawProv.name || rawProv.provider_name || code;
      const isProvActive = rawProv.status === 1 || rawProv.status === '1' || rawProv.status === true;

      if (!code || !isProvActive) continue;

      const providerId = providerMap.get(code) || crypto.randomUUID();
      providerMap.set(code, providerId);

      providerBatch.push({
        id: providerId,
        providerCode: code,
        providerName: name,
        providerLogo: rawProv.logo || `/assets/${code.toLowerCase()}.png`,
        status: true,
        isVisible: true,
        sortOrder: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  } else {
    console.log('⚠️ API provider list unavailable or blocked. Merging standard catalog...');
  }

  // Merge Standard / Fallback Providers
  const defaultProviders = [
    { providerCode: 'HABANERO', providerName: 'Habanero', providerLogo: 'https://assets.bd34fgabh.com/img/habanero/logo.png' },
    { providerCode: 'PRAGMATIC', providerName: 'Pragmatic Play', providerLogo: 'https://assets.bd34fgabh.com/img/pragmatic/logo.png' },
    { providerCode: 'BOOONGO', providerName: 'Booongo', providerLogo: 'https://assets.bd34fgabh.com/img/booongo/logo.png' },
    { providerCode: 'PLAYSON', providerName: 'Playson', providerLogo: 'https://assets.bd34fgabh.com/img/playson/logo.png' },
    { providerCode: 'SPRIBE', providerName: 'Spribe', providerLogo: '/aviator.png' },
    { providerCode: 'EVOLUTION', providerName: 'Evolution Gaming', providerLogo: '/assets/featured/live-casino.png' },
    { providerCode: '87ORIGINALS', providerName: '87 Originals', providerLogo: '/assets/casino.png' },
  ];

  for (const p of [...FALLBACK_PROVIDERS, ...defaultProviders]) {
    const code = p.providerCode.toUpperCase().trim();
    if (!providerMap.has(code)) {
      const providerId = crypto.randomUUID();
      providerMap.set(code, providerId);
      providerBatch.push({
        id: providerId,
        providerCode: code,
        providerName: p.providerName,
        providerLogo: p.providerLogo,
        status: true,
        isVisible: true,
        sortOrder: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  if (providerBatch.length > 0) {
    const { error } = await supabase.from('Provider').upsert(providerBatch, { onConflict: 'providerCode' });
    if (error) {
      console.error('- Provider batch upsert error:', error.message);
    } else {
      console.log(`+ Upserted ${providerBatch.length} providers into Supabase Provider table.`);
    }
  }

  // 3. Build Games Batch
  console.log('\n🎮 Step 2: Preparing Active Games for Batch Upsert...');
  const gamesMap = new Map<string, any>(); // gameCode -> row

  // Fetch Existing Games to reuse UUIDs
  const { data: existingGames } = await supabase
    .from('Game')
    .select('id, gameCode');

  const existingGameIdMap = new Map<string, string>();
  if (existingGames) {
    existingGames.forEach(g => existingGameIdMap.set(g.gameCode, g.id));
  }

  // Try API game fetch for each provider
  for (const [code, providerId] of providerMap.entries()) {
    const apiGameData = await fetchFromApi('game_list', { provider_code: code });
    if (apiGameData && apiGameData.status === 1 && Array.isArray(apiGameData.games)) {
      for (const rawGame of apiGameData.games) {
        const gameCode = (rawGame.game_code || rawGame.code || '').trim();
        const gameName = rawGame.game_name || rawGame.name || gameCode;
        const isGameActive = rawGame.status === 1 || rawGame.status === '1' || rawGame.status === true;

        if (!gameCode || !isGameActive) continue;

        const gameId = existingGameIdMap.get(gameCode) || crypto.randomUUID();
        gamesMap.set(gameCode, {
          id: gameId,
          providerId,
          providerGameId: rawGame.game_code || gameCode,
          gameCode,
          gameName,
          category: rawGame.category || rawGame.game_type || 'Slots',
          thumbnail: rawGame.banner || rawGame.thumbnail || `/assets/games/${gameCode}.png`,
          banner: rawGame.banner || rawGame.thumbnail || `/assets/games/${gameCode}.png`,
          launchCode: gameCode,
          status: 'live',
          maintenanceMode: false,
          currentlyAvailable: true,
          isActive: true,
          isFeatured: false,
          isPopular: false,
          homepageVisible: true,
          sortOrder: 0,
          playCount: 0,
          tags: [],
          launchReady: true,
          validationErrors: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  // Merge Fallback Catalog
  for (const g of FALLBACK_GAMES) {
    if (!g.gameCode || gamesMap.has(g.gameCode)) continue;

    const provName = (g.providerName || g.Provider?.providerName || 'Pragmatic Play').toUpperCase();
    let provCode = 'PRAGMATIC';
    if (provName.includes('BOOONGO') || provName.includes('3 OAKS') || provName.includes('3OAKS')) provCode = 'BOOONGO';
    else if (provName.includes('HABANERO')) provCode = 'HABANERO';
    else if (provName.includes('PLAYSON')) provCode = 'PLAYSON';
    else if (provName.includes('SPRIBE')) provCode = 'SPRIBE';
    else if (provName.includes('EVOLUTION')) provCode = 'EVOLUTION';
    else if (provName.includes('87 ORIGINALS')) provCode = '87ORIGINALS';

    const providerId = providerMap.get(provCode) || providerMap.get('PRAGMATIC');
    if (!providerId) continue;

    const gameId = existingGameIdMap.get(g.gameCode) || crypto.randomUUID();
    gamesMap.set(g.gameCode, {
      id: gameId,
      providerId,
      providerGameId: g.providerGameId || g.gameCode,
      gameCode: g.gameCode,
      gameName: g.gameName,
      category: g.category || 'Slots',
      thumbnail: g.thumbnail || g.image_url || '/default-game.svg',
      banner: g.banner || g.image_url || '/default-game.svg',
      launchCode: g.launchCode || g.gameCode,
      status: 'live',
      maintenanceMode: false,
      currentlyAvailable: true,
      isActive: true,
      isFeatured: g.isFeatured ?? false,
      isPopular: g.isPopular ?? false,
      homepageVisible: true,
      sortOrder: g.sortOrder ?? 0,
      playCount: g.playCount ?? 0,
      tags: [],
      launchReady: true,
      validationErrors: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  const allGames = Array.from(gamesMap.values());
  console.log(`✓ Total active games prepared for upsert: ${allGames.length}`);

  // Batch Upsert Games in Chunks of 100
  const gameChunks = chunkArray(allGames, 100);
  let upsertedGamesCount = 0;

  for (let i = 0; i < gameChunks.length; i++) {
    const chunk = gameChunks[i];
    const { error } = await supabase.from('Game').upsert(chunk, { onConflict: 'gameCode' });
    if (error) {
      console.error(`- Error upserting game chunk ${i + 1}/${gameChunks.length}:`, error.message);
    } else {
      upsertedGamesCount += chunk.length;
    }
  }

  // 4. Final Count Verification
  const [{ count: finalProviderCount }, { count: finalGameCount }] = await Promise.all([
    supabase.from('Provider').select('id', { count: 'exact', head: true }),
    supabase.from('Game').select('id', { count: 'exact', head: true }),
  ]);

  console.log('\n=========================================================');
  console.log(`🎉 SUCCESS! Supabase Database Synced & Fully Populated!`);
  console.log(`📊 Providers Table Total Rows : ${finalProviderCount ?? 0}`);
  console.log(`📊 Games Table Total Rows     : ${finalGameCount ?? 0}`);
  console.log('=========================================================\n');
}

main().catch(console.error);
