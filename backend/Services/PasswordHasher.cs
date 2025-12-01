using System.Security.Cryptography;
using System.Text;
using Konscious.Security.Cryptography;

namespace backend.Services
{
    public class PasswordHasher
    {
        private const int SaltSize = 16; // 128-bit
        private const int HashSize = 32; // 256-bit

        public string Hash(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
            {
                throw new ArgumentException("Password cannot be empty.", nameof(password));
            }

            byte[] salt = RandomNumberGenerator.GetBytes(SaltSize);
            byte[] hash = HashInternal(password, salt);

            byte[] combined = new byte[salt.Length + hash.Length];
            Buffer.BlockCopy(salt, 0, combined, 0, salt.Length);
            Buffer.BlockCopy(hash, 0, combined, salt.Length, hash.Length);

            return Convert.ToBase64String(combined);
        }

        public bool Verify(string password, string stored)
        {
            if (string.IsNullOrWhiteSpace(stored))
            {
                return false;
            }

            byte[] combined;
            try
            {
                combined = Convert.FromBase64String(stored);
            }
            catch
            {
                // Not a valid base64 string -> treat as invalid hash
                return false;
            }

            if (combined.Length < SaltSize + 1)
            {
                return false;
            }

            byte[] salt = new byte[SaltSize];
            byte[] storedHash = new byte[combined.Length - SaltSize];

            Buffer.BlockCopy(combined, 0, salt, 0, SaltSize);
            Buffer.BlockCopy(combined, SaltSize, storedHash, 0, storedHash.Length);

            byte[] computedHash = HashInternal(password, salt);

            return CryptographicOperations.FixedTimeEquals(storedHash, computedHash);
        }

        private static byte[] HashInternal(string password, byte[] salt)
        {
            var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
            {
                Salt = salt,
                // Reasonable defaults for an interactive login scenario
                DegreeOfParallelism = 8,  // number of CPU cores to use
                Iterations = 4,
                MemorySize = 64 * 1024    // 64 MB
            };

            return argon2.GetBytes(HashSize);
        }
    }
}

