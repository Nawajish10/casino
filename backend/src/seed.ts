import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { FALLBACK_PROVIDERS, FALLBACK_GAMES } from './data/games.fallback';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🌱 Populating Supabase Database with Providers and Games...');

  const providerMap = new Map<string, string>(); // code -> id

  // 1. Seed Providers
  for (const p of FALLBACK_PROVIDERS) {
    const { data: existing } = await supabase
      .from('Provider')
      .select('id')
      .eq('providerCode', p.providerCode)
      .single();

    if (existing) {
      providerMap.set(p.providerCode, existing.id);
      console.log(`✓ Provider exists: ${p.providerName} (${p.providerCode})`);
    } else {
      const newId = crypto.randomUUID();
      const { error } = await supabase.from('Provider').insert({
        id: newId,
        providerCode: p.providerCode,
        providerName: p.providerName,
        providerLogo: p.providerLogo,
        status: true,
        isVisible: true,
        sortOrder: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      if (!error) {
        providerMap.set(p.providerCode, newId);
        console.log(`+ Inserted Provider: ${p.providerName} (${p.providerCode})`);
      } else {
        console.error(`- Failed to insert provider ${p.providerCode}:`, error.message);
      }
    }
  }

  // Extra standard providers
  const extraProviders = [
    { providerCode: 'SPRIBE', providerName: 'Spribe', providerLogo: '/aviator.png' },
    { providerCode: 'EVOLUTION', providerName: 'Evolution Gaming', providerLogo: '/assets/featured/live-casino.png' },
    { providerCode: '87ORIGINALS', providerName: '87 Originals', providerLogo: '/assets/casino.png' },
  ];

  for (const p of extraProviders) {
    if (!providerMap.has(p.providerCode)) {
      const { data: existing } = await supabase
        .from('Provider')
        .select('id')
        .eq('providerCode', p.providerCode)
        .single();

      if (existing) {
        providerMap.set(p.providerCode, existing.id);
      } else {
        const newId = crypto.randomUUID();
        const { error } = await supabase.from('Provider').insert({
          id: newId,
          providerCode: p.providerCode,
          providerName: p.providerName,
          providerLogo: p.providerLogo,
          status: true,
          isVisible: true,
          sortOrder: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        if (!error) {
          providerMap.set(p.providerCode, newId);
          console.log(`+ Inserted Provider: ${p.providerName} (${p.providerCode})`);
        }
      }
    }
  }

  // 2. Seed Games
  let gamesInserted = 0;
  for (const g of FALLBACK_GAMES) {
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

    const { data: existing } = await supabase
      .from('Game')
      .select('id')
      .eq('gameCode', g.gameCode)
      .single();

    if (!existing) {
      const { error } = await supabase.from('Game').insert({
        id: crypto.randomUUID(),
        providerId,
        providerGameId: g.providerGameId || g.gameCode,
        gameCode: g.gameCode,
        gameName: g.gameName,
        category: g.category || 'Slots',
        thumbnail: g.thumbnail,
        banner: g.banner,
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

      if (!error) {
        gamesInserted++;
      } else {
        console.error(`- Failed to insert game ${g.gameCode}:`, error.message);
      }
    }
  }

  console.log(`\n🎉 DONE! Database successfully populated with ${providerMap.size} Providers and ${gamesInserted} Games!`);
}

main().catch(console.error);
