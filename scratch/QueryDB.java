import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class QueryDB {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/examhub_auth?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
        String user = "root";
        String password = "Aastha19@";

        try {
            Connection conn = DriverManager.getConnection(url, user, password);
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT id, username, email, role FROM users");
            
            System.out.println("ID | Username | Email | Role");
            System.out.println("-----------------------------------------");
            while(rs.next()) {
                System.out.println(rs.getInt("id") + " | " + rs.getString("username") + " | " + rs.getString("email") + " | " + rs.getString("role"));
            }
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
