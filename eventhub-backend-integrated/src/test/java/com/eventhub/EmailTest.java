package com.eventhub;

import com.eventhub.util.EmailUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class EmailTest {

    @Autowired
    private EmailUtil emailUtil;

    @Test
    void testSendVerificationEmail() {

        String to = "eventhub4uofficial@gmail.com";
        String name = "Test Student";
        String token = "TEST-VERIFICATION-TOKEN-123";

        System.out.println("========================================");
        System.out.println("Starting real email test...");
        System.out.println("Sending to: " + to);

        emailUtil.sendVerificationEmail(
                to,
                name,
                token
        );

        System.out.println("========================================");
        System.out.println("Email method executed.");
        System.out.println("Check: " + to);
        System.out.println("========================================");
    }
}