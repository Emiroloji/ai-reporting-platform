package com.aireporting.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendTemporaryPasswordEmail(String toEmail, String temporaryPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@aireporting.com");
        message.setTo(toEmail);
        message.setSubject("AI Raporlama Platformu'na Davet Edildiniz!");
        message.setText("Merhaba,\n\nAI Raporlama Platformu'na davet edildiniz.\n\n" +
                "Aşağıdaki geçici şifrenizle giriş yapabilirsiniz:\n\n" +
                "Şifre: " + temporaryPassword + "\n\n" +
                "Giriş yaptıktan sonra şifrenizi profil sayfanızdan değiştirmenizi öneririz.\n\n" +
                "Teşekkürler,\nAI Raporlama Ekibi");

        mailSender.send(message);
    }
}