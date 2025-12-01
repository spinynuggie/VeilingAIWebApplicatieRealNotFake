using Microsoft.VisualStudio.TestTools.UnitTesting;
using backend.Services;

namespace backend.Test;

[TestClass]
public class PasswordTests
{
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
