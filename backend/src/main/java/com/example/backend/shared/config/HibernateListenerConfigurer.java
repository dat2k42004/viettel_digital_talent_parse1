package com.example.backend.shared.config;

import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.PersistenceUnit;
import lombok.RequiredArgsConstructor;
import org.hibernate.event.service.spi.EventListenerRegistry;
import org.hibernate.event.spi.EventType;
import org.hibernate.internal.SessionFactoryImpl;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class HibernateListenerConfigurer {

    @PersistenceUnit
    private final EntityManagerFactory entityManagerFactory;
    private final HibernateAuditEventListener auditEventListener;

    @PostConstruct
    public void registerListeners() {
        SessionFactoryImpl sessionFactory = entityManagerFactory.unwrap(SessionFactoryImpl.class);
        EventListenerRegistry registry = sessionFactory.getServiceRegistry().getService(EventListenerRegistry.class);

        registry.getEventListenerGroup(EventType.POST_COMMIT_INSERT).appendListener(auditEventListener);
        registry.getEventListenerGroup(EventType.POST_COMMIT_UPDATE).appendListener(auditEventListener);
        registry.getEventListenerGroup(EventType.POST_COMMIT_DELETE).appendListener(auditEventListener);
    }
}
