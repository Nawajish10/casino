# Game Launch

## Launch Game

Launches a slot or live game and returns a URL for the player.

### Endpoint

```
POST https://{API_SERVER}
```

**Content-Type:** `application/json`

### Request

**Method:** `game_launch`

#### Slot game

```json
{
    "method": "game_launch",
    "agent_code": "your_agent_code",
    "agent_token": "your_agent_token",
    "user_code": "test",
    "provider_code": "PRAGMATIC",
    "game_code": "vs20doghouse",
    "lang": "en",
    "rtp": 92,
    "lobby_url": "https://your-site.com/lobby"
}
```

#### Live game

```json
{
    "method": "game_launch",
    "agent_code": "your_agent_code",
    "agent_token": "your_agent_token",
    "user_code": "test",
    "provider_code": "EVOLUTION",
    "game_code": "nxpkul2hgclallno",
    "lang": "en",
    "lobby_url": "https://your-site.com/lobby"
}
```

> For live games, `game_code` is optional. When empty, a lobby URL is returned.

<table><thead><tr><th width="140">Field</th><th width="86">Type</th><th width="116">Required</th><th>Description</th></tr></thead><tbody><tr><td><code>method</code></td><td>string</td><td>Yes</td><td>Must be <code>game_launch</code></td></tr><tr><td><code>agent_code</code></td><td>string</td><td>Yes</td><td>Your agent code</td></tr><tr><td><code>agent_token</code></td><td>string</td><td>Yes</td><td>Your agent API token</td></tr><tr><td><code>user_code</code></td><td>string</td><td>Yes</td><td>Player identifier</td></tr><tr><td><code>provider_code</code></td><td>string</td><td>Yes</td><td>Provider code</td></tr><tr><td><code>game_code</code></td><td>string</td><td>Optional</td><td>Game code (optional for live lobby)</td></tr><tr><td><code>lang</code></td><td>string</td><td>Yes</td><td>Language code (e.g. <code>en</code>)</td></tr><tr><td><code>rtp</code></td><td>number</td><td>No</td><td>Target RTP for this launch. If omitted, the user's configured RTP is used</td></tr><tr><td><code>lobby_url</code></td><td>string</td><td>No</td><td>URL to redirect the player when they exit the game. Defaults to empty string</td></tr></tbody></table>

### Response

#### Success

```json
{
    "status": 1,
    "msg": "SUCCESS",
    "launch_url": "http://pragmaticplay.oaxznmnojw.net/..."
}
```

#### Failure

```json
{
    "status": 0,
    "msg": "INVALID_PROVIDER"
}
```


# Agent & User Info

## **Endpoint**

```
POST https://{API_SERVER}
```

## **Agent Info**

### **Request Body**

{% code fullWidth="false" %}

```json
{
  "method": "money_info",
  "agent_code": "testAgent",
  "agent_token": "41f5cc794aef2b138c715cf25f767cc1"
}
```

{% endcode %}

<table><thead><tr><th width="183">Key</th><th width="145">Type</th><th>Description</th></tr></thead><tbody><tr><td>method</td><td>string</td><td>The method type (<code>money_info</code>)</td></tr><tr><td>agent_code</td><td>string</td><td>The agent's code</td></tr><tr><td>agent_token</td><td>string</td><td>The agent's authentication token</td></tr></tbody></table>

### **Success Response Example**

```json
{
    "status": 1,
    "msg": "SUCCESS",
    "agent": {
        "agent_code": "testAgent",
        "balance": 1000000
    }
}
```

### **Failure Response Example**

```json
{
  "status": 0,
  "msg": "INVALID_PARAMETER"
}
```

***

## **User Info**

### **Request Body**

{% code fullWidth="false" %}

```json
{
  "method": "money_info",
  "agent_code": "testAgent",
  "agent_token": "41f5cc794aef2b138c715cf25f767cc1",
  "user_code": "testUser"
}
```

{% endcode %}

<table><thead><tr><th width="183">Key</th><th width="145">Type</th><th>Description</th></tr></thead><tbody><tr><td>method</td><td>string</td><td>The method type (<code>money_info</code>)</td></tr><tr><td>agent_code</td><td>string</td><td>The agent's code</td></tr><tr><td>agent_token</td><td>string</td><td>The agent's authentication token</td></tr><tr><td>user_code</td><td>string</td><td>The user's code</td></tr></tbody></table>

### **Success Response Example**

```json
{
    "status": 1,
    "msg": "SUCCESS",
    "agent": {
        "agent_code": "testAgent",
        "balance": 1000000,
    },
    "user": {
        "user_code": "testUser",
        "balance": 100000,
    }
}
```

### **Failure Response Example**

```json
{
  "status": 0,
  "msg": "INVALID_PARAMETER"
}
```

***

## **All Users Info**

### **Request Body**

{% code fullWidth="false" %}

```json
{
  "method": "money_info",
  "agent_code": "testAgent",
  "agent_token": "41f5cc794aef2b138c715cf25f767cc1",
  "all_users": true
}
```

{% endcode %}

<table><thead><tr><th width="183">Key</th><th width="145">Type</th><th>Description</th></tr></thead><tbody><tr><td>method</td><td>string</td><td>The method type (<code>game_list</code>)</td></tr><tr><td>agent_code</td><td>string</td><td>The agent's code</td></tr><tr><td>agent_token</td><td>string</td><td>The agent's authentication token</td></tr><tr><td>all_users</td><td>boolean</td><td><code>true</code></td></tr></tbody></table>

### **Success Response Example**

```json
{
    "status": 1,
    "msg": "SUCCESS",
    "agent": {
        "agent_code": "testAgent",
        "balance": 99550000
    },
    "user_list": [
        {
            "user_code": "testUser1",
            "balance": 450000
        },
        {
            "user_code": "testUser2",
            "balance": 20000
        }
    ]
}
```

### **Failure Response Example**

```json
{
  "status": 0,
  "msg": "INVALID_PARAMETER"
}
```


# Provider List

## **Endpoint**

```
POST https://{API_SERVER}
```

## **Request Body**

{% code fullWidth="false" %}

```json
{
    "method": "provider_list",
    "agent_code": "testAgent",
    "agent_token": "41f5cc794aef2b138c715cf25f767cc1"
}
```

{% endcode %}

<table><thead><tr><th width="183">Key</th><th width="145">Type</th><th>Description</th></tr></thead><tbody><tr><td>method</td><td>string</td><td>The method type ( <code>provider_list</code>)</td></tr><tr><td>agent_code</td><td>string</td><td>The agent's code</td></tr><tr><td>agent_token</td><td>string</td><td>The agent's authentication token</td></tr></tbody></table>

## **Success Response Example**

```json
{
  "status": 1,
  "msg": "SUCCESS",
  "providers": [
    {
      "code": "PRAGMATIC",
      "name": "Pragmatic Play",
      "status": 1
    }
  ]
}
```

| Key       | Type            | Description                   |
| --------- | --------------- | ----------------------------- |
| status    | integer (32bit) | `1` – Success, `0` – Failure  |
| msg       | string          | Response message              |
| providers | array           | List of available providers   |
| code      | string          | Provider code                 |
| name      | string          | Provider name                 |
| status    | integer (32bit) | `1` – Open, `0` – Maintenance |

***

## **Failure Response Example**

```json
{
  "status": 0,
  "msg": "INTERNAL_ERROR"
}
```

| Key    | Type            | Description   |
| ------ | --------------- | ------------- |
| status | integer (32bit) | `0` – Failure |
| msg    | string          | Error message |


# Game List

## **Endpoint**

```
POST https://{API_SERVER}
```

## **Request Body**

{% code fullWidth="false" %}

```json
{
   "method": "game_list",
   "agent_code": "testAgent",
   "agent_token": "41f5cc794aef2b138c715cf25f767cc1",
   "provider_code": "PRAGMATIC"
}
```

{% endcode %}

<table><thead><tr><th width="183">Key</th><th width="145">Type</th><th>Description</th></tr></thead><tbody><tr><td>method</td><td>string</td><td>The method type (<code>game_list</code>)</td></tr><tr><td>agent_code</td><td>string</td><td>The agent's code</td></tr><tr><td>agent_token</td><td>string</td><td>The agent's authentication token</td></tr><tr><td>provider_code</td><td>string</td><td>Provider code</td></tr></tbody></table>

## **Success Response Example**

```json
{
  "status": 1,
  "msg": "SUCCESS",
  "games": [
    {
      "game_code": "vs20doghouse",
      "game_name": "The Dog House",
      "banner": "https://.../vs20doghouse.png",
      "status": 1
    },
    {
      "game_code": "vs243mwarrior",
      "game_name": "Monkey Warrior",
      "banner": "https://.../vs243mwarrior.png",
      "status": 0
    }
  ]
}
```

| Key        | Type            | Description                    |
| ---------- | --------------- | ------------------------------ |
| status     | integer (32bit) | `1` – Success, `0` – Failure   |
| msg        | string          | Response message               |
| games      | array           | List of games                  |
| game\_code | string          | Unique code for the game       |
| game\_name | string          | Game name                      |
| banner     | string          | URL of the game's banner image |
| status     | integer (32bit) | `1` – Open, `0` – Maintenance  |

***

## **Failure Response Example**

```json
{
  "status": 0,
  "msg": "INTERNAL_ERROR"
}
```

| Key    | Type            | Description   |
| ------ | --------------- | ------------- |
| status | integer (32bit) | `0` – Failure |
| msg    | string          | Error message |


# Game Log

## End**point**

```
POST https://{API_SERVER}
```

## **Request Body**

```json
{
  "method": "get_game_log",
  "agent_code": "testAgent",
  "agent_token": "41f5cc794aef2b138c715cf25f767cc1",
  "user_code": "tsetAgent",
  "game_type": "slot",
  "start": "2021-09-17 00:00:00",
  "end": "2021-09-17 23:59:00",
  "page": 0,
  "perPage": 1000
}
```

<table><thead><tr><th width="128">Key</th><th width="89">Type</th><th>Description</th></tr></thead><tbody><tr><td><strong>method</strong></td><td>string</td><td>The method type(<code>get_game_log</code>) </td></tr><tr><td><strong>agent_code</strong></td><td>string</td><td>The agent's code</td></tr><tr><td><strong>agent_token</strong></td><td>string</td><td>The agent's authentication token</td></tr><tr><td><a data-footnote-ref href="#user-content-fn-1"><strong>user_code</strong></a></td><td>string</td><td>The user's code</td></tr><tr><td><a data-footnote-ref href="#user-content-fn-2"><strong>game_type</strong></a></td><td>string</td><td>The type of game for which the log is being retrieved.</td></tr><tr><td><strong>start</strong></td><td>string</td><td>The start date and time for the search in the format <code>yyyy-MM-dd HH:mm:ss</code>.</td></tr><tr><td><strong>end</strong></td><td>string</td><td>The end date and time for the search in the format <code>yyyy-MM-dd HH:mm:ss</code>.</td></tr><tr><td><strong>page</strong></td><td>integer</td><td>The page number for pagination (used for multiple results).</td></tr><tr><td><strong>perPage</strong></td><td>integer</td><td>The number of records to return per page (maximum 1,000,000).</td></tr></tbody></table>

## **Success Response**

<table><thead><tr><th width="132">Key</th><th width="139">Type</th><th>Description</th></tr></thead><tbody><tr><td><strong>status</strong></td><td>integer (32-bit)</td><td>The response status. <code>1</code> means success.</td></tr><tr><td><strong>total_count</strong></td><td>integer (32-bit)</td><td>The total number of logs that match the query criteria.</td></tr><tr><td><strong>page</strong></td><td>integer (32-bit)</td><td>The current page number of the results.</td></tr><tr><td><strong>perPage</strong></td><td>integer (32-bit)</td><td>The number of records returned per page (as per the request).</td></tr><tr><td><strong>slot</strong></td><td>array</td><td>A list of game transaction logs matching the request, with each log entry containing transaction details.</td></tr></tbody></table>

**Transaction Log Details (Inside `slot` array):**

<table><thead><tr><th width="185">Key</th><th width="144">Type</th><th>Description</th></tr></thead><tbody><tr><td><strong>history_id</strong></td><td>integer (64-bit)</td><td>The unique ID of the transaction history entry.</td></tr><tr><td><strong>agent_code</strong></td><td>string</td><td>The code of the agent who processed the transaction.</td></tr><tr><td><strong>user_code</strong></td><td>string</td><td>The code of the user who made the transaction.</td></tr><tr><td><strong>provider_code</strong></td><td>string</td><td>The code of the game provider.</td></tr><tr><td><strong>game_code</strong></td><td>string</td><td>The unique game identifier (e.g., <code>vs20doghouse</code>).</td></tr><tr><td><strong>type</strong></td><td>string</td><td>The type of transaction (e.g., <code>BASE</code>, <code>FREE</code>).</td></tr><tr><td><strong>bet_money</strong></td><td>double</td><td>The amount of money bet by the user.</td></tr><tr><td><strong>win_money</strong></td><td>double</td><td>The amount of money won by the user.</td></tr><tr><td><strong>txn_id</strong></td><td>string</td><td>The unique transaction ID.</td></tr><tr><td><strong>txn_type</strong></td><td>string</td><td>The type of transaction (e.g., <code>debit_credit</code>)</td></tr><tr><td><strong>user_start_balance</strong></td><td>double</td><td>The user's balance before the transaction.</td></tr><tr><td><strong>user_end_balance</strong></td><td>double</td><td>The user's balance after the transaction.</td></tr><tr><td><strong>agent_start_balance</strong></td><td>double</td><td>The agent's balance before the transaction.</td></tr><tr><td><strong>agent_end_balance</strong></td><td>double</td><td>The agent's balance after the transaction.</td></tr><tr><td><strong>created_at</strong></td><td>string</td><td>The date and time when the transaction was created.</td></tr></tbody></table>

### **Example Success Response**

```json
{
  "status": 1,
  "total_count": 340,
  "page": 0,
  "perPage": 1000,
  "slot": [
    {
      "history_id": 777,
      "agent_code": "admin",
      "user_code": "test",
      "provider_code": "PRAGMATIC",
      "game_code": "vs20doghouse",
      "type": "BASE",
      "bet_money": 2000,
      "win_money": 0,
      "txn_id": "64a83f2fc597acc9004eec52c3f84c30",
      "txn_type": "debit_credit",
      "user_start_balance": 230500,
      "user_end_balance": 228500,
      "agent_start_balance": 22092000,
      "agent_end_balance": 22092000,
      "created_at": "2021-09-17T12:50:42.000Z"
    },
    ...
  ]
}
```

### **Failure Response Example**

```json
{
    "status": 0,
    "msg": "Invalid Parameter.",
    "detail": "perPage must be less than or equal to 1000000"
}
```

#### **Explanation:**

<table><thead><tr><th width="97">Key</th><th width="141">Type</th><th>Description</th></tr></thead><tbody><tr><td><strong>status</strong></td><td>integer (32-bit)</td><td>Indicates the response status. A value of <code>0</code> indicates a failure.</td></tr><tr><td><strong>msg</strong></td><td>string</td><td>A brief message describing the error. In this case, <code>Invalid Parameter.</code> indicates an invalid parameter was provided.</td></tr><tr><td><strong>detail</strong></td><td>string</td><td>A more detailed message explaining the specific issue. </td></tr></tbody></table>

[^1]: If not specified, the API will return the entire transaction history for the agent.

[^2]: `slot` for slot games, `live` for live casino


# In-Game History

Unlike `get_game_log`, this does not return transaction records directly — it returns a link to the provider's history page.

> **Availability:** Currently supported for **Pragmatic Play Slot** only (`provider_code`: `PRAGMATIC`). Other providers will return `INVALID_PROVIDER`.

### Endpoint

```
POST https://{API_SERVER}
```

**Content-Type:** `application/json`

### Request

**Method:** `get_game_history`

```json
{
    "method": "get_game_history",
    "agent_code": "your_agent_code",
    "agent_token": "your_agent_token",
    "user_code": "test",
    "provider_code": "PRAGMATIC",
    "game_code": "vs20doghouse"
}
```

<table><thead><tr><th width="145">Field</th><th width="89">Type</th><th width="117">Required</th><th>Description</th></tr></thead><tbody><tr><td><code>method</code></td><td>string</td><td>Yes</td><td>Must be <code>get_game_history</code></td></tr><tr><td><code>agent_code</code></td><td>string</td><td>Yes</td><td>Your agent code</td></tr><tr><td><code>agent_token</code></td><td>string</td><td>Yes</td><td>Your agent API token</td></tr><tr><td><code>user_code</code></td><td>string</td><td>Yes</td><td>Player identifier</td></tr><tr><td><code>provider_code</code></td><td>string</td><td>Yes</td><td>Must be <code>PRAGMATIC</code> (Pragmatic Play Slot only)</td></tr><tr><td><code>game_code</code></td><td>string</td><td>Yes</td><td>Pragmatic Play slot game code (e.g. <code>vs20doghouse</code>)</td></tr></tbody></table>

### Response

#### Success

```json
{
    "status": 1,
    "msg": "SUCCESS",
    "history_url": "https://game-server.example.com/gs2c/lastGameHistory.do?symbol=vs20doghouse&mgckey=..."
}
```

| Field         | Description                                                 |
| ------------- | ----------------------------------------------------------- |
| `history_url` | URL to open the provider's game history page for the player |

#### Failure

**Invalid provider (not Pragmatic Play Slot):**

```json
{
    "status": 0,
    "msg": "INVALID_PROVIDER"
}
```

**External provider error:**

```json
{
    "status": 0,
    "msg": "EXTERNAL_ERROR : INVALID_GAME"
}
```

**Internal error:**

```json
{
    "status": 0,
    "msg": "INTERNAL_ERROR"
}
```
# Deposit / Withdraw User Balance

## End**point**

```
POST https://{API_SERVER}
```

## **Request Body**

<pre class="language-json"><code class="lang-json"><strong>{
</strong>    "method": "user_deposit",
    "agent_code": "testAgent",
    "agent_token": "c3041c6d9146a164387fa454eff7b432",
    "user_code": "test",
    "amount": 10000.00,
    "agent_sign"："UNIQUE_ID"   // Optional to prevent duplicated
}
</code></pre>

```json
{
    "method": "user_withdraw",
    "agent_code": "testAgent",
    "agent_token": "c3041c6d9146a164387fa454eff7b432",
    "user_code": "test",
    "amount": 10000.00,
    "agent_sign"："UNIQUE_ID"   // Optional to prevent duplicated
}
```

<table><thead><tr><th width="130">Key</th><th width="96">Type</th><th>Description</th></tr></thead><tbody><tr><td><code>method</code></td><td>string</td><td>API method name. For balance transfer to a user game wallet, the value must be <code>user_deposit</code> or  <code>user_withdraw</code>.</td></tr><tr><td><code>agent_code</code></td><td>string</td><td>Unique agent identifier provided by NEXUS. Used to identify which agent is sending the request.</td></tr><tr><td><code>agent_token</code></td><td>string</td><td>Secret authentication token assigned to the agent. Used for API authentication and request validation.</td></tr><tr><td><code>user_code</code></td><td>string</td><td>Unique user identifier within the agent’s platform. This user will receive the transferred balance.</td></tr><tr><td><code>amount</code></td><td>double</td><td>Amount to transfer from the agent balance to the user API balance. Supports up to 2 digits after the decimal point. Example: <code>10000.00</code></td></tr><tr><td><code>agent_sign</code></td><td>string</td><td>Optional unique request identifier used to prevent duplicated requests. Recommended for transaction safety and idempotency handling. Example: UUID, hash string, timestamp-based unique value.</td></tr></tbody></table>

## **Response Example**

```json
{
    "status": 1, 
    "msg": "SUCCESS",
    "agent_balance": 990000,
    "user_balance": 10000
}
```

```json
{
    "status": 0,
    "msg": "INSUFFICIENT_AGENT_FUNDS" / "INSUFFICIENT_USER_FUNDS"
}
```

<table><thead><tr><th width="151">Field</th><th width="86">Type</th><th>Description</th></tr></thead><tbody><tr><td><code>status</code></td><td>int</td><td>Request processing status. <code>1</code> indicates success, while <code>0</code> indicates failure.</td></tr><tr><td><code>msg</code></td><td>string</td><td>Response message describing the result of the request. Example:  <code>SUCCESS: "INSUFFICIENT_AGENT_FUNDS"</code>.</td></tr><tr><td><code>agent_balance</code></td><td>double</td><td>Remaining balance of the agent after the transaction has been processed successfully. Supports up to 2 digits after the decimal point. </td></tr><tr><td><code>user_balance</code></td><td>double</td><td>Updated API balance of the user after the transaction has been completed successfully. Supports up to 2 digits after the decimal point. </td></tr></tbody></table>


# Reset User Balance

### Endpoint

```
POST https://{API_SERVER}
```

**Content-Type:** `application/json`

### Request

**Method:** `user_withdraw_reset`

#### Single user

```json
{
    "method": "user_withdraw_reset",
    "agent_code": "your_agent_code",
    "agent_token": "your_agent_token",
    "user_code": "test"
}
```

#### All users

```json
{
    "method": "user_withdraw_reset",
    "agent_code": "your_agent_code",
    "agent_token": "your_agent_token",
    "all_users": true
}
```

<table><thead><tr><th width="122">Field</th><th width="98">Type</th><th width="119">Required</th><th>Description</th></tr></thead><tbody><tr><td><code>method</code></td><td>string</td><td>Yes</td><td>Must be <code>user_withdraw_reset</code></td></tr><tr><td><code>agent_code</code></td><td>string</td><td>Yes</td><td>Your agent code</td></tr><tr><td><code>agent_token</code></td><td>string</td><td>Yes</td><td>Your agent API token</td></tr><tr><td><code>user_code</code></td><td>string</td><td>Conditional</td><td>Required when resetting a single user</td></tr><tr><td><code>all_users</code></td><td>boolean</td><td>No</td><td>When <code>true</code>, resets all users</td></tr></tbody></table>

### Response

#### Success — single user

```json
{
    "status": 1,
    "msg": "SUCCESS",
    "agent": {
        "agent_code": "your_agent_code",
        "balance": 1000000
    },
    "user": {
        "user_code": "test",
        "withdraw_amount": 5600,
        "balance": 0
    }
}
```

#### Success — all users

```json
{
    "status": 1,
    "msg": "SUCCESS",
    "agent": {
        "agent_code": "your_agent_code",
        "balance": 1076850
    },
    "user_list": [
        {
            "user_code": "test",
            "withdraw_amount": 20000,
            "balance": 0
        },
        {
            "user_code": "test2",
            "withdraw_amount": 56850,
            "balance": 0
        }
    ]
}
```

#### Failure

```json
{
    "status": 0,
    "msg": "INVALID_PARAMETER"
}
```

# Transfer Status

### Endpoint

```
POST https://{API_SERVER}
```

**Content-Type:** `application/json`

### Request

**Method:** `transfer_status`

```json
{
    "method": "transfer_status",
    "agent_code": "your_agent_code",
    "agent_token": "your_agent_token",
    "user_code": "test",
    "agent_sign": "UNIQUE_ID"
}
```

<table><thead><tr><th width="122">Field</th><th width="101">Type</th><th width="109">Required</th><th>Description</th></tr></thead><tbody><tr><td><code>method</code></td><td>string</td><td>Yes</td><td>Must be <code>transfer_status</code></td></tr><tr><td><code>agent_code</code></td><td>string</td><td>Yes</td><td>Your agent code</td></tr><tr><td><code>agent_token</code></td><td>string</td><td>Yes</td><td>Your agent API token</td></tr><tr><td><code>user_code</code></td><td>string</td><td>Yes</td><td>Target user</td></tr><tr><td><code>agent_sign</code></td><td>string</td><td>Yes</td><td>Unique ID from the original deposit/withdraw request</td></tr></tbody></table>

### Response

#### Success

```json
{
    "status": 1,
    "msg": "SUCCESS",
    "amount": 10000,
    "agent_balance": 990000,
    "user_balance": 10000,
    "type": "user_deposit"
}
```

#### Failure

```json
{
    "status": 0,
    "msg": "NOT FOUND"
}
```
