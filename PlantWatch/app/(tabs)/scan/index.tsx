import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';
import { useIsFocused } from '@react-navigation/native';
import { CameraMode, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [mode, setMode] = useState<CameraMode>("picture");
  const [facing, setFacing] = useState<CameraType>("back");
  const focused = useIsFocused();
  const { session, user } = useAuth();

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.centeredContainer}>
        <ThemedText style={{ textAlign: "center" }}>
          We need your permission to use the camera.
        </ThemedText>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant permission</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const take_picture = async () => {
    const photo = await ref.current?.takePictureAsync();
    if (photo?.uri) {
      // Navigate to preview with the image URI
      router.push({
        pathname: '/scan/preview',
        params: { imageUri: photo.uri }
      });
    }
  };

  const route_to_history = () => {
    router.push('/scan/history');
  };

  // Only render camera when tab is focused
  if (!focused) {
    return <ThemedView style={{ flex: 1 }} />;
  }

  return (
    <ThemedView style={styles.cameraContainer}>
        {/* only show if authenticated */}
        {session && user && (
        <TouchableOpacity 
            style={styles.scanHistoryButton} 
            onPress={route_to_history}
        >
            <Text style={styles.scanHistoryButtonText}>Scan History</Text>
        </TouchableOpacity>
        )}

        <CameraView
            style={styles.camera}
            ref={ref}
            mode={mode}
            facing={facing}
            mute={true}
            responsiveOrientationWhenOrientationLocked
        />

        <ThemedView style={styles.shutterContainer}>
            <Pressable onPress={take_picture}>
                {({ pressed }) => (
                <ThemedView
                    style={[
                    styles.shutterBtn,
                    {
                        opacity: pressed ? 0.5 : 1,
                    },
                    ]}
                >
                    <ThemedView
                    style={[
                        styles.shutterBtnInner,
                        {
                        backgroundColor: mode === "picture" ? "white" : "red",
                        },
                    ]}
                    />
                </ThemedView>
                )}
            </Pressable>
        </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1c4415',
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
  },
  scanHistoryButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 10,
    borderRadius: 20,
    backgroundColor: '#1c4415',
  },
  scanHistoryButtonText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  shutterContainer: {
    position: "absolute",
    bottom: 20,
    backgroundColor: "transparent",
    left: 0,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
});