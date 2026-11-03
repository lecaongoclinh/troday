package com.troday.dto.response;

import com.troday.model.PersonalProfile;
import com.troday.model.User;
import java.time.Instant;
import java.util.Set;

public record UserResponse(String id, String fullName, String email, String phoneNumber,
                           Set<User.Role> roles, User.Status status, Instant phoneVerifiedAt,
                           Profile profile, NotificationSettings notificationSettings) {
    public record Profile(String id, String avatarFileId, String address, String gender,
                          String occupation, String university, String bio) {
        public static Profile from(PersonalProfile p) {
            return p == null ? null : new Profile(p.id().toString(), p.avatarFileId() == null ? null : p.avatarFileId().toString(),
                    p.address(), p.gender(), p.occupation(), p.university(), p.bio());
        }
    }
    public record NotificationSettings(boolean inAppEnabled, boolean emailEnabled, boolean pushEnabled) {}

    public static UserResponse from(User u, Set<User.Role> roles, PersonalProfile profile) {
        return new UserResponse(u.id().toString(), u.fullName(), u.email(), u.phoneNumber(), Set.copyOf(roles), u.status(),
                u.phoneVerifiedAt(), Profile.from(profile), new NotificationSettings(u.inAppEnabled(), u.emailEnabled(), u.pushEnabled()));
    }
}
