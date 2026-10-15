import fs from 'fs/promises';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'roasts.json');

async function ensureDb() {
    try {
        await fs.mkdir(DB_DIR, { recursive: true });
    } catch (e) {}

    try {
        await fs.access(DB_FILE);
    } catch (e) {
        // File doesn't exist, create it with empty array
        await fs.writeFile(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
}

export async function getRoasts() {
    await ensureDb();
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
}

export async function getRoastById(id) {
    const roasts = await getRoasts();
    return roasts.find(r => r.id === id) || null;
}

export async function saveRoast(roastData) {
    await ensureDb();
    const roasts = await getRoasts();
    
    // Fallback ID generation if crypto.randomUUID is not available on server env
    const newRoast = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        created_at: new Date().toISOString(),
        ...roastData
    };

    roasts.push(newRoast);
    await fs.writeFile(DB_FILE, JSON.stringify(roasts, null, 2), 'utf-8');
    return newRoast;
}

export async function updateRoast(id, updatedFields) {
    await ensureDb();
    const roasts = await getRoasts();
    const index = roasts.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    roasts[index] = { ...roasts[index], ...updatedFields };
    await fs.writeFile(DB_FILE, JSON.stringify(roasts, null, 2), 'utf-8');
    return roasts[index];
}

