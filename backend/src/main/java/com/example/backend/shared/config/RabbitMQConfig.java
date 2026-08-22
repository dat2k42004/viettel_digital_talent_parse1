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

    // ==========================================
    // ASSET QR CODE QUEUE INFRASTRUCTURE
    // ==========================================
    public static final String EXCHANGE_ASSET_QR = "asset.qrcode.exchange";
    public static final String QUEUE_ASSET_QR = "asset.qrcode.queue";
    public static final String ROUTING_KEY_ASSET_QR = "asset.qrcode.routing-key";

    public static final String DLX_ASSET_QR = "asset.qrcode.dlx";
    public static final String DLQ_ASSET_QR = "asset.qrcode.dlq";
    public static final String DLQ_ROUTING_KEY_ASSET_QR = "asset.qrcode.dlq.routing-key";

    @Bean
    public org.springframework.amqp.core.DirectExchange assetQrExchange() {
        return new org.springframework.amqp.core.DirectExchange(EXCHANGE_ASSET_QR, true, false);
    }

    @Bean
    public Queue assetQrQueue() {
        return org.springframework.amqp.core.QueueBuilder.durable(QUEUE_ASSET_QR)
                .withArgument("x-dead-letter-exchange", DLX_ASSET_QR)
                .withArgument("x-dead-letter-routing-key", DLQ_ROUTING_KEY_ASSET_QR)
                .build();
    }

    @Bean
    public org.springframework.amqp.core.Binding assetQrBinding() {
        return org.springframework.amqp.core.BindingBuilder.bind(assetQrQueue())
                .to(assetQrExchange())
                .with(ROUTING_KEY_ASSET_QR);
    }

    @Bean
    public org.springframework.amqp.core.DirectExchange assetQrDlx() {
        return new org.springframework.amqp.core.DirectExchange(DLX_ASSET_QR, true, false);
    }

    @Bean
    public Queue assetQrDlq() {
        return org.springframework.amqp.core.QueueBuilder.durable(DLQ_ASSET_QR).build();
    }

    @Bean
    public org.springframework.amqp.core.Binding assetQrDlqBinding() {
        return org.springframework.amqp.core.BindingBuilder.bind(assetQrDlq())
                .to(assetQrDlx())
                .with(DLQ_ROUTING_KEY_ASSET_QR);
    }

    @Bean
    public org.springframework.retry.interceptor.RetryOperationsInterceptor assetQrRetryInterceptor() {
        return org.springframework.amqp.rabbit.config.RetryInterceptorBuilder.stateless()
                .maxAttempts(3)
                .backOffOptions(2000, 2.0, 10000)
                .recoverer(new org.springframework.amqp.rabbit.retry.RejectAndDontRequeueRecoverer())
                .build();
    }

    @Bean
    public SimpleRabbitListenerContainerFactory assetQrListenerContainerFactory(
            ConnectionFactory connectionFactory,
            MessageConverter jsonMessageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jsonMessageConverter);
        factory.setConcurrentConsumers(2);
        factory.setMaxConcurrentConsumers(5);
        factory.setPrefetchCount(10);
        factory.setAdviceChain(assetQrRetryInterceptor());
        return factory;
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
