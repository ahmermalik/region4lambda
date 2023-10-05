const sql = require('mssql');
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const secret_name = "region/rds"; 
const client = new SecretsManagerClient({ region: "us-east-2" });

exports.handler = async (event) => {
    let secretResponse;
    let secretData;

    try {
        secretResponse = await client.send(new GetSecretValueCommand({ SecretId: secret_name, VersionStage: "AWSCURRENT" }));
        secretData = JSON.parse(secretResponse.SecretString);
    } catch (error) {
        console.log("Error retrieving secret", error);
        throw error;
    }

    const config = {
        user: secretData.username,
        password: secretData.password,
        server: 'aws-region4.cud6w3qimwoj.us-east-2.rds.amazonaws.com',
        database: 'regionfourdb',
        options: {
            encrypt: true,
            trustServerCertificate: true
        },
    };

    let connection = await sql.connect(config);
    let result = await connection.request().query('SELECT * FROM Products');

    return {
        statusCode: 200,
        body: JSON.stringify(result.recordset)
    };
};

//test pipeline