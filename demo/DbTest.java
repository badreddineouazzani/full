import java.sql.*;
public class DbTest {
  public static void main(String[] a) throws Exception {
    String url = "jdbc:sqlserver://DESKTOP-8\\SQLEXPRESS:53384;databaseName=AuthSpring;integratedSecurity=true;encrypt=true;trustServerCertificate=true";
    System.out.println("URL=" + url);
    try (Connection c = DriverManager.getConnection(url)) {
      System.out.println("OK connected");
    } catch (Exception e) {
      System.out.println("ERR: " + e.getClass().getName() + ": " + e.getMessage());
    }
  }
}
