import mysql from 'mysql2/promise';

// Assumindo que MySQL e Node.js estão na mesma máquina
const pool = mysql.createPool({
  host: 'localhost', // Ou '127.0.0.1'
  user: 'root',
  password: '', // A sua senha do MySQL
  database: 'sistema_chamados_ti',
  port: 3306 // Porta padrão do MySQL (pode omitir se for 3306)
  // connectTimeout: 20000 // Mantenha se adicionou para o ETIMEDOUT
});

// ... resto do ficheiro ...

export default pool;

    
    const API_URL = 'http://192.168.2.104:3001'; // DEPOIS (Use o IP da sua máquina backend)
    
