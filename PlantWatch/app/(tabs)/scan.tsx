import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRef, useState } from "react";
import { Button, Pressable, Platform, StyleSheet } from 'react-native';
import { ThemeContext, useIsFocused } from '@react-navigation/native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { rgbaColor } from "react-native-reanimated/lib/typescript/Colors";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [mode, setMode] = useState<CameraMode>("picture");
  const [facing, setFacing] = useState<CameraType>("back");
  const focused = useIsFocused();
  let currScreen = "camera";

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.centeredContainer}>
        <ThemedText style={{ textAlign: "center" }}>
          We need your permission to use the camera
        </ThemedText>
        <Button onPress={requestPermission} title="Grant permission" />
      </ThemedView>
    );
  }

  // example logic, rework
  const takePicture = async () => {
    // const photo = await ref.current?.takePictureAsync();
    // if (photo?.uri) setUri(photo.uri);
  };

  const setScreenScanHis = () => {
    currScreen = "scanHistory";
  }

  const setScreenCam = (screen: string) => {
    currScreen = "camera";
  }

  const screenScanResult = (scanId: string) => {
    //TODO
  }

  const screenEmpty = () => {
    return (<ThemedView></ThemedView>);
  }

  const renderCamera = () => {
    return (
      <ThemedView style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          ref={ref}
          mode={mode}
          facing={facing}
          mute={true}
          responsiveOrientationWhenOrientationLocked
        />
        <ThemedView style={styles.shutterContainer}>
          <Pressable onPress={takePicture}>
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
        <ThemedView style={styles.scanHistoryButtonContainer}>
          <Pressable onPress={setScreenScanHis}>

          </Pressable>
        </ThemedView>
      </ThemedView>
    );
  };

  const renderProcessingScan = () => {

  }

  const renderScanResults = () => {

  }

  if (currScreen === "scanHistory") {

  } else { // Default to camera
    return focused ? renderCamera() : screenEmpty();
  }
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  cameraContainer: StyleSheet.absoluteFillObject,
  camera: StyleSheet.absoluteFillObject,
  scanHistoryButtonContainer: {
    position: "absolute",
    top: 20,
    backgroundColor: "transparent",
    left: 20,
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 30,
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
