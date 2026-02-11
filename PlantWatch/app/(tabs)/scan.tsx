import { useIsFocused } from '@react-navigation/native';
import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { Image } from "expo-image";
import { useRef, useState } from "react";
import { Button, Pressable, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | undefined>(undefined);
  const [mode, setMode] = useState<CameraMode>("picture");
  const [facing, setFacing] = useState<CameraType>("back");
  const focused = useIsFocused();
  const [currScreen, setScreen] = useState("camera");

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
    const photo = await ref.current?.takePictureAsync();
    if (photo?.uri) {
      setUri(photo.uri);
      setScreenScanPreview();
    }
  };

  const setScreenScanHis = () => {
    setScreen("scanHistory");
  }

  const setScreenCam = () => {
    setScreen("camera");
  }

  const setScreenScanPreview = () => {
    setScreen("scanPreview")
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

  const renderScanPreview = () => {
    return (
    <ThemedView style={styles.scanImageContainer}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={setScreenCam}
      >
        <Text style={{fontSize: 24, color: "#ffffff"}}>←</Text>
      </TouchableOpacity>
      <Image 
        source = {{ uri }}
        contentFit = "cover"
        style = {styles.scanImage}
      />
      <TouchableOpacity 
        style={styles.submitButton}
        onPress={() => {
          // Handle submit logic here
          console.log('Submit scan pressed');
        }}
      >
        <Text style={styles.submitButtonText}> Submit Scan </Text>
      </TouchableOpacity>
    </ThemedView>
    );
  }

  const renderProcessingScan = () => {

  }

  const renderScanResults = () => {

  }

  if (currScreen === "scanHistory") {

  } else if (currScreen === "scanPreview") {
    return renderScanPreview();
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
  scanImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    
  },
  scanImage: {
    width: '80%',
    height: '70%',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#1c4415'
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1c4415',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#1c4415',
    marginHorizontal: 20,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  cameraContainer: StyleSheet.absoluteFillObject,
  camera: StyleSheet.absoluteFillObject,
  scanHistoryButtonContainer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "transparent",
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
