using Microsoft.VisualStudio.TestTools.UnitTesting;
using backend.Services;

namespace backend.Test;

/// <summary>
/// Unit tests for <see cref="backend.Services.PasswordHasher"/> to validate hashing and verification.
/// </summary>
[TestClass]
public class PasswordTests
{
    /// <summary>
    /// Verifies that hashing a password and verifying it succeeds and fails for wrong passwords.
    /// </summary>
    [TestMethod]
    public void TestHashing()
    {
        var hasher = new PasswordHasher();
        string password = "securePassword123";
        string hash = hasher.Hash(password);
        Assert.IsTrue(hasher.Verify(password, hash));
        Assert.IsFalse(hasher.Verify("wrongPassword", hash));
    }
}
