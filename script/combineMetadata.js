import fs from 'fs';
import path from 'path';

const input = './metadata/';
const output = './metadata.json';

let result = [];

fs.readdirSync(input).forEach(filename => {
    if (filename.endsWith('.json')) {
        const filePath = path.join(input, filename);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        const tokenId = filename.replace('.json', '');
        result.push({tokenId, attributes: data.attributes});
    }
});

fs.writeFileSync(output, JSON.stringify(result, null, 2));
console.log(`Combined data saved to: ${output}`);
