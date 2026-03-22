using RAGulator.API.Models;

namespace RAGulator.API.Services;

public interface ISystemConfigurationService
{
    Task<SystemConfiguration> GetConfigurationAsync();
    Task<SystemConfiguration> SaveConfigurationAsync(SystemConfiguration config);
}
