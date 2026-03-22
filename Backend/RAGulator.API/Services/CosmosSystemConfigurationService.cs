using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;
using RAGulator.API.Configuration;
using RAGulator.API.Models;

namespace RAGulator.API.Services;

public class CosmosSystemConfigurationService : ISystemConfigurationService
{
    private readonly CosmosClient _cosmosClient;
    private readonly string _databaseName;
    private readonly string _containerName = "SystemConfig";
    private Container? _container;

    public CosmosSystemConfigurationService(IOptions<CosmosDBConfig> options)
    {
        _databaseName = options.Value.DatabaseName;
        if (!string.IsNullOrWhiteSpace(options.Value.ConnectionString))
        {
            _cosmosClient = new CosmosClient(options.Value.ConnectionString);
        }
    }

    private async Task<Container?> GetContainerAsync()
    {
        if (_cosmosClient == null) return null;
        if (_container != null) return _container;

        try 
        {
            var db = await _cosmosClient.CreateDatabaseIfNotExistsAsync(_databaseName);
            var containerResponse = await db.Database.CreateContainerIfNotExistsAsync(
                id: _containerName,
                partitionKeyPath: "/id"
            );
            _container = containerResponse.Container;
            return _container;
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error initializing Cosmos configuration container: " + ex.Message);
            return null;
        }
    }

    public async Task<SystemConfiguration> GetConfigurationAsync()
    {
        var container = await GetContainerAsync();
        if (container == null) return new SystemConfiguration(); // Fallback temporal si no hay DB

        try
        {
            return await container.ReadItemAsync<SystemConfiguration>("global-config", new PartitionKey("global-config"));
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            // First time running, DB doesn't have the config yet. Return default.
            return new SystemConfiguration();
        }
        catch
        {
            // Any other connection error => Return default
            return new SystemConfiguration();
        }
    }

    public async Task<SystemConfiguration> SaveConfigurationAsync(SystemConfiguration config)
    {
        config.Id = "global-config"; // Keep it tightly restricted to a single master instance
        var container = await GetContainerAsync();
        if (container != null)
        {
            await container.UpsertItemAsync(config, new PartitionKey(config.Id));
        }
        return config;
    }
}
