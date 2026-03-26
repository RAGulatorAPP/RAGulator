using System.Collections.Generic;
using System.Threading.Tasks;

namespace RAGulator.API.Services;

public interface IOneDriveService
{
    Task<List<object>> GetDrivesAsync();
    Task<List<object>> GetDriveItemsAsync(string driveId, string itemId = "root");
    Task<object?> ResolveSharingLinkAsync(string shareUrl);
    Task<string> SyncFolderAsync(string driveId, string folderId);
}
