import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { FeatureKey, RootStackParamList } from "../navigation/types";
import { useApp } from "../contexts/AppContext";
import { endpoints, allowed, groups } from "../api/catalog";
import { featureGroups, blockedOperations } from "../services/workflows";
import { colors, ui } from "../theme";
import { Icon } from "./common";

export function WorkflowActions({ feature }: { feature: FeatureKey }) {
  const app = useApp(),
    nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>(),
    [open, setOpen] = useState(false);
  if (!app.user) return null;
  const relevant = endpoints.filter(
    (e) =>
      (featureGroups[feature] ?? []).includes(e.group) &&
      allowed(e, app.user?.roles ?? [], app.role),
  );
  return (
    <View style={{ gap: 12 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Các thao tác liên quan"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((v) => !v)}
        style={[ui.card, ui.between]}
      >
        <Text style={ui.text}>Các thao tác liên quan</Text>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={18} />
      </Pressable>
      {open &&
        groups
          .filter((g) => (featureGroups[feature] ?? []).includes(g[0]))
          .map((group) => (
            <View key={group[0]} style={{ gap: 9 }}>
              <Text style={ui.eyebrow}>{group[1]}</Text>
              {relevant
                .filter((e) => e.group === group[0])
                .map((e) => (
                  <Pressable
                    key={e.id}
                    accessibilityRole="button"
                    disabled={!!blockedOperations[e.id]}
                    style={[
                      ui.card,
                      {
                        padding: 14,
                        opacity: blockedOperations[e.id] ? 0.6 : 1,
                      },
                    ]}
                    onPress={() => {
                      if (e.id === "API-170") nav.navigate("Upload");
                      else
                        nav.navigate("Operation", {
                          endpointId: Number(e.id.slice(4)),
                        });
                    }}
                  >
                    <View style={ui.between}>
                      <Text style={[ui.text, { flex: 1, fontSize: 12 }]}>
                        {e.title}
                      </Text>
                      <Icon
                        name={
                          blockedOperations[e.id] ? "clock" : "chevron-right"
                        }
                        size={15}
                      />
                    </View>
                    {blockedOperations[e.id] && (
                      <Text style={[ui.muted, { fontSize: 10 }]}>
                        {blockedOperations[e.id]}
                      </Text>
                    )}
                  </Pressable>
                ))}
            </View>
          ))}
    </View>
  );
}
