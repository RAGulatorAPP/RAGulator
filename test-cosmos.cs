using Microsoft.Azure.Cosmos;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        string connectionString = args.Length > 0 ? args[0] : "";
        string databaseName = "ragulator-db";
        string containerName = "ChatSessions";

        if (string.IsNullOrEmpty(connectionString))
        {
            Console.WriteLine("ERROR: No connection string provided.");
            return;
        }

        try
        {
            Console.WriteLine($"Conectando a Cosmos DB...");
            using var client = new CosmosClient(connectionString);
            
            Console.WriteLine($"Verificando base de datos: {databaseName}");
            var dbResponse = await client.CreateDatabaseIfNotExistsAsync(databaseName);
            Console.WriteLine($"Base de datos lista (Status: {dbResponse.StatusCode})");

            Console.WriteLine($"Verificando contenedor: {containerName} con /userId");
            var containerResponse = await dbResponse.Database.CreateContainerIfNotExistsAsync(containerName, "/userId");
            Console.WriteLine($"Contenedor listo (Status: {containerResponse.StatusCode})");

            Console.WriteLine("SUCCESS: Conexión y configuración de Cosmos DB correctas.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"FAILURE: {ex.GetType().Name}: {ex.Message}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
            }
        }
    }
}
