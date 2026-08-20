const oracledb = require('oracledb');

async function test() {
    try {
        const conn = await oracledb.getConnection({
            user: 'C##Khoula',
            password: 'khoulaPass123',
            connectString: 'localhost:1521/orcl'
        });
        console.log('SUCCESS!');
        await conn.close();
    } catch (err) {
        console.error('FAILED:', err.message);
    }
}

test();