using RAGulator.API.Models;

namespace RAGulator.API.Services;

/// <summary>
/// Fallback en memoria si Cosmos DB no está disponible. Ideal para testing cruzado.
/// </summary>
public class LocalSystemConfigurationService : ISystemConfigurationService
{
    private SystemConfiguration _currentConfig = new SystemConfiguration();
    
    public Task<SystemConfiguration> GetConfigurationAsync()
    {
        return Task.FromResult(_currentConfig);
    }

    public Task<SystemConfiguration> SaveConfigurationAsync(SystemConfiguration config)
    {
        config.Id = "global-config";
        _currentConfig = config;
        return Task.FromResult(_currentConfig);
    }
}
