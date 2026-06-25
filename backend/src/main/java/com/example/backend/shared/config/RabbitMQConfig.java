package com.example.backend.shared.config;

import org.springframework.amqp.core.AmqpAdmin;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;

@Configuration
public class RabbitMQConfig {

    // private final AsyncConfig asyncConfig;
    // private final AmqpAdmin amqpAdmin;

    // RabbitMQConfig(AmqpAdmin amqpAdmin, AsyncConfig asyncConfig) {
    // this.amqpAdmin = amqpAdmin;
    // this.asyncConfig = asyncConfig;
    // }

    @Bean
    public Queue mailQueue() {
        return new Queue("mail.queue", true);
    }

    @Bean
    public Queue tenantStatusQueue() {
        return new Queue("tenant.status.queue", true);
    }

    @Bean
    public Queue tenantInitConfigQueue() {
        return new Queue("tenant.init-config.queue", true);
    }

    @Bean
    public Queue tenantInitAdminPermissionsQueue() {
        return new Queue("tenant.init-admin-permissions.queue", true);
    }

    @Bean
    public Queue dotKiemKeAggregateQueue() {
        return new Queue("inventory.dot-kiem-ke-aggregate.queue", true);
    }

    @Bean
    public Queue bienDongTonKho() {
        return new Queue("inventory.bien-dong-ton-kho.queue", true);
    }

    @Bean
    public Queue bienDongCapPhat() {
        return new Queue("inventory.bien-dong-cap-phat.queue", true);
    }

    @Bean
    public Queue bienDongBaoTri() {
        return new Queue("inventory.bien-dong-bao-tri.queue", true);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    @Lazy
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }

    @Bean
    public AmqpAdmin amqpAdmin(ConnectionFactory connectionFactory) {
        return new RabbitAdmin(connectionFactory);
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            MessageConverter jsonMessageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jsonMessageConverter);
        factory.setConcurrentConsumers(5);
        factory.setMaxConcurrentConsumers(10);
        factory.setPrefetchCount(250);
        return factory;
    }
}
