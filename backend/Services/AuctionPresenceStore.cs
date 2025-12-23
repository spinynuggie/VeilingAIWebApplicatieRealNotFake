using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

namespace backend.Services
{
    public sealed class AuctionPresenceStore
    {
        private readonly ConcurrentDictionary<string, ConcurrentDictionary<int, byte>> _connectionVeilingen = new();
        private readonly ConcurrentDictionary<int, int> _veilingCounts = new();

        public void AddConnection(string connectionId, int veilingId)
        {
            var set = _connectionVeilingen.GetOrAdd(connectionId, _ => new ConcurrentDictionary<int, byte>());
            if (set.TryAdd(veilingId, 0))
            {
                _veilingCounts.AddOrUpdate(veilingId, 1, (_, count) => count + 1);
            }
        }

        public void RemoveConnection(string connectionId, int veilingId)
        {
            if (!_connectionVeilingen.TryGetValue(connectionId, out var set))
            {
                return;
            }

            if (set.TryRemove(veilingId, out _))
            {
                _veilingCounts.AddOrUpdate(veilingId, 0, (_, count) => count > 0 ? count - 1 : 0);
                if (_veilingCounts.TryGetValue(veilingId, out var count) && count == 0)
                {
                    _veilingCounts.TryRemove(veilingId, out _);
                }
            }

            if (set.IsEmpty)
            {
                _connectionVeilingen.TryRemove(connectionId, out _);
            }
        }

        public void RemoveConnection(string connectionId)
        {
            if (!_connectionVeilingen.TryRemove(connectionId, out var set))
            {
                return;
            }

            foreach (var veilingId in set.Keys)
            {
                _veilingCounts.AddOrUpdate(veilingId, 0, (_, count) => count > 0 ? count - 1 : 0);
                if (_veilingCounts.TryGetValue(veilingId, out var count) && count == 0)
                {
                    _veilingCounts.TryRemove(veilingId, out _);
                }
            }
        }

        public IReadOnlyList<int> GetActiveVeilingIds()
        {
            return _veilingCounts.Keys.ToList();
        }
    }
}
