#!/usr/bin/env tsx

import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';
import glob from 'glob';
import yaml from 'yaml';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Survivor API Documentation',
      version: '0.1.0',
      description: 'API documentation for the Survivor application',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
    ],
  },
  apis: [] as string[],
};

const files = glob.sync('./src/app/api/**/*.ts');
const validFiles: string[] = [];

files.forEach((file: string) => {
  const content = fs.readFileSync(file, 'utf-8');
  const matches = content.match(/@openapi([\s\S]*?)\*\//g);
  let valid = true;

  if (matches) {
    matches.forEach(block => {
        const yamlStr = block
            .replace(/@openapi\s*/, '')
            .replace(/^\s*\/\*\*|\*\/\s*$/g, '')
            .replace(/^\s*\*\s?/gm, '');

        try {
            yaml.parse(yamlStr);
        } catch (err) {
            console.error(`❌ YAML parsing error in file: ${file}`);
            console.error(err);
            valid = false;
        }
    });
  }

  if (valid) validFiles.push(file);
});

options.apis = validFiles;

const specs = swaggerJsdoc(options);

const docsDir = path.join(process.cwd(), 'docs', 'api');
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

const swaggerFile = path.join(docsDir, 'swagger.json');
fs.writeFileSync(swaggerFile, JSON.stringify(specs, null, 2));

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Survivor API Documentation</title>
<link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
<script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-standalone-preset.js"></script>
<script>
  window.onload = function() {
    SwaggerUIBundle({
      url: './swagger.json',
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIStandalonePreset
      ],
      plugins: [
        SwaggerUIBundle.plugins.DownloadUrl
      ],
      layout: "StandaloneLayout"
    });
  };
</script>
</body>
</html>`;

const htmlFile = path.join(docsDir, 'index.html');
fs.writeFileSync(htmlFile, htmlContent);

console.log('✅ Swagger documentation generated successfully!');
console.log(`📁 Files created:`);
console.log(`   - ${swaggerFile}`);
console.log(`   - ${htmlFile}`);
console.log('⚠ Warnings about invalid YAML blocks (if any) have been shown above.');
