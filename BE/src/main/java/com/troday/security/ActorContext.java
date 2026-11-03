package com.troday.security;

import com.troday.exception.DomainException;
import com.troday.model.User;
import java.util.Set;
import org.springframework.security.core.context.SecurityContextHolder;

public record ActorContext(long userId, long sessionId, Set<User.Role> roles) {
    public ActorContext { roles = Set.copyOf(roles); }

    public static ActorContext current() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof ActorContext actor))
            throw DomainException.unauthenticated();
        return actor;
    }
}
