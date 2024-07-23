import { Footer, NavbarHome } from './components';

export function AboutPage() {
  const ourSignatureStart = `{
  "OrderComponents": {
    "Offerer": "mande.eth",
    "Offer": [
      {
        "ItemType": 2,
        "Token": "0x1dDB3...CF8B7",
        "IdentifierOrCriteria": 125,
        "StartAmount": 1,
        "EndAmount": 1
      }
    ],
    "Consideration": [
      {
        "ItemType": 0,
        "Token": "0x00000...00000",
        "IdentifierOrCriteria": 0,
        "StartAmount": 500000000000000000,
        "EndAmount": 500000000000000000,
        "Recipient": "mande.eth"
      },
      {
        "ItemType": 0,
        "Token": "0x00000...00000",
        "IdentifierOrCriteria": 0,
        "StartAmount": 1000000000000000,
        "EndAmount": 1000000000000000,
        "Recipient": "0x88FE6...08E9c"
      },`;
  const ourSignatureNewInput = `
      {
        "ItemType": 4,
        "Token": "0x1dDB3...CF8B7",
        "IdentifierOrCriteria": "0xd6b42...7b5e0",
        "StartAmount": 1,
        "EndAmount": 1,
        "Recipient": "mande.eth"
      }`;
  const ourSignatureEnd = `
  ],
    "StartTime": 0,
    "EndTime": 1724284774,
    "OrderType": 0,
    "Zone": "0x004C0...60C00",
    "ZoneHash": "0x00000...00000",
    "Salt": 0,
    "ConduitKey": "0x00000...f0000",
    "Counter": 36359...31144
  }
}`;

  const openseaSignature = `{
  "OrderComponents": {
    "Offerer": "mande.eth",
    "Offer": [
      {
        "ItemType": 2,
        "Token": "0x1dDB3...CF8B7",
        "IdentifierOrCriteria": 125,
        "StartAmount": 1,
        "EndAmount": 1
      }
    ],
    "Consideration": [
      {
        "ItemType": 0,
        "Token": "0x00000...00000",
        "IdentifierOrCriteria": 0,
        "StartAmount": 487500000000000000,
        "EndAmount": 487500000000000000,
        "Recipient": "mande.eth"
      },
      {
        "ItemType": 0,
        "Token": "0x00000...00000",
        "IdentifierOrCriteria": 0,
        "StartAmount": 12500000000000000,
        "EndAmount": 12500000000000000,
        "Recipient": "0x0000a...Aa719"
      }








    ],
    "StartTime": 1721694368,
    "EndTime": 1724372768,
    "OrderType": 0,
    "Zone": "0x004C0...60C00",
    "ZoneHash": "0x00000...00000",
    "Salt": 24446...60762,
    "ConduitKey": "0x00000...f0000",
    "Counter": 36359...31144
  }
}`;
  return (
    <>
      <NavbarHome />
      <div className="flex flex-col h-full">
        <div className="max-w-screen-lg w-full mx-auto flex-grow">
          <div className="p-8 flex flex-col gap-8">
            <h1 className="pb-8">About</h1>
            <div className="flex flex-col gap-4">
              <h2 className="font-bold text-lg">How it works?</h2>
              <p></p>
              <div className="flex justify-between text-zinc-400">
                <div>
                  <div className="bg-zinc-900 font-mono p-4 mb-1 text-zinc-200">Opensea</div>
                  <pre className="p-4 bg-zinc-900 rounded">
                    <code>{openseaSignature}</code>
                  </pre>
                </div>
                <div>
                  <div className="bg-zinc-900 font-mono p-4 mb-1 text-zinc-200">Collectoor</div>
                  <pre className="p-4 bg-zinc-900 rounded">
                    <code>{ourSignatureStart}</code>
                    <code className="text-green-400">{ourSignatureNewInput}</code>
                    <code>{ourSignatureEnd}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
