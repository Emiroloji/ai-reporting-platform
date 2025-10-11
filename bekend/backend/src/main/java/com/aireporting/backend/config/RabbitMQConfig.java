// src/main/java/com/aireporting/backend/config/RabbitMQConfig.java

package com.aireporting.backend.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String ANALYSIS_QUEUE = "analysisQueue";

    @Bean
    public Queue analysisQueue() {
        return new Queue(ANALYSIS_QUEUE, false);
    }

    /**
     * Bu Bean, Spring AMQP'nin mesajları gönderirken ve alırken
     * standart Java serileştirmesi yerine JSON formatını kullanmasını sağlar.
     * Bu, hem güvenlik sorunlarını çözer hem de sistemler arası uyumluluğu artırır.
     */
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}