import prisma from "../src/infrastructure/persistence/prisma/client";

function main() {
  const keys = Object.keys(prisma as unknown as Record<string, unknown>);
  console.log(keys.filter(k => /opportun/i.test(k)).sort());
}

main();
