import { LoadingSpinner } from '@/components/loading-spin';
import { ScanHistory } from '@/components/scan-history';
import { ScanResults } from '@/components/scan-results';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BackButton } from '@/components/ui/back-button';
import { useIsFocused } from '@react-navigation/native';
import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { Image } from "expo-image";
import { SaveFormat, useImageManipulator } from 'expo-image-manipulator';
import { useRef, useState } from "react";
import { Alert, Button, Pressable, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { scan_plant } from '@/hooks/scanPlant';
import { useAuth } from '@/hooks/useAuth';
import { PlantScanResult } from '@/interfaces/plant';
import { logScan } from '@/services/plant';

export default function ScanScreen() {
  const screens = {
    CAMERA: "camera",
    LOADING: "loading",
    SCAN_PREVIEW: "scanPreview",
    SCAN_PROCESSING: "scanProcessing",
    SCAN_RESULTS: "scanResults",
    SCAN_HISTORY: "scanHistory",
  };
  const [permission, request_permission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | undefined>(undefined);
  const [mode, setMode] = useState<CameraMode>("picture");
  const [facing, setFacing] = useState<CameraType>("back");
  const focused = useIsFocused();
  const [currScreen, setScreen] = useState("camera");
  const [scanResults, setScanResults] = useState<PlantScanResult | {}>({});
  const scanContext = useImageManipulator(uri ?? '');
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
        <Button onPress={request_permission} title="Grant permission" />
      </ThemedView>
    );
  }


  const take_picture = async () => {
    setScreen(screens.LOADING);
    const photo = await ref.current?.takePictureAsync();
    if (photo?.uri) {
      setUri(photo.uri);
      setScreen(screens.SCAN_PREVIEW);
    }
  };

  // Convert to JPEG, 90% compression
  const reformat_image = async () => {
    // need to touch up what happens if this fails
    if (uri == undefined) return;
    const renderedImage = await scanContext.renderAsync();
    const result = await renderedImage.saveAsync({
      base64: true,
      compress: 0.9,
      format: SaveFormat.JPEG,
    });

    setUri(result.uri);
  }

  const submit_scan = async () => {
    setScreen(screens.SCAN_PROCESSING);
    if (uri == undefined) return;

    await reformat_image();
    const scanResponse = await scan_plant(uri);
    if (!scanResponse.error) {
      setScanResults(scanResponse.data);
      if (session && user)
        logScan(user.id, uri, scanResponse.data as PlantScanResult);
      setScreen(screens.SCAN_RESULTS);
    } else {
      setScreen(screens.CAMERA);
      Alert.alert("Identification Failed", "The A.I. failed to identify the plant. Please try scanning the plant again in better lighting or at a different angle.");
    }
  }

  const setScanFromHistory = (scan: any) => {
    setUri(scan.scan_img_url);
    setScanResults({
        imageUri: scan.scan_img_uri,
        commonName: scan.common_name,
        scientificName: scan.scientific_name,
        genus: scan.genus,
        family: scan.family,
        confidenceScore: String(scan.confidence_score),
        description: 'placeholder'
    } as PlantScanResult);
  }


  const render_empty = () => {
    return (<ThemedView></ThemedView>);
  }

  const render_camera = () => {
    return (
      <ThemedView style={styles.cameraContainer}>
        <TouchableOpacity style={[styles.scanHistoryButton, {display: (session && user) ? 'flex' : 'none'}]} onPress={() => {setScreen(screens.SCAN_HISTORY)}}>
          <Text style={{fontSize: 16, color: "#ffffff"}}>Scan History</Text>
        </TouchableOpacity>

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
        <ThemedView style={styles.scanHistoryButtonContainer}>
          <Pressable onPress={() => {setScreen(screens.SCAN_HISTORY)}}>

          </Pressable>
        </ThemedView>
      </ThemedView>
    );
  };

  const render_scan_preview = () => {
    return (
    <ThemedView style={styles.scanImageContainer}>
      <BackButton onPress={() => setScreen(screens.CAMERA)}/>
      <Image 
        source = {{ uri }}
        contentFit = "cover"
        style = {styles.scanImage}
      />
      <TouchableOpacity 
        style={styles.submitButton}
        onPress={submit_scan}
      >
        <Text style={styles.submitButtonText}> Submit Scan </Text>
      </TouchableOpacity>
    </ThemedView>
    );
  }

  const render_loading = () => {
    return (
      <ThemedView style={styles.centeredContainer}>
        <ThemedText style={{paddingBottom: 5, fontWeight: 600}}>Loading...</ThemedText>
        <LoadingSpinner />
      </ThemedView>
    );
  }

  const render_scan_processing = () => {
    return (
      <ThemedView style={styles.centeredContainer}>
        <ThemedText style={{paddingBottom: 5, fontWeight: 600}}>Processing...</ThemedText>
        <LoadingSpinner />
      </ThemedView>
    );
  }

  const render_scan_results = () => {
    let scan = scanResults as PlantScanResult;
    return (
      <ThemedView style={{flex: 1}}>
        <BackButton onPress={() => setScreen(screens.CAMERA)}/>
        <ScanResults 
          imageUri={uri? uri : "placeholder image here"}
          commonName={scan.commonName}
          scientificName={scan.scientificName}
          genus={scan.genus}
          family={scan.family}
          confidenceScore={scan.confidenceScore}
          description='testing'
        />
        
      </ThemedView>
    );
  }

  const render_scan_history = () => {
    return (
      <ThemedView style={{flex: 1}}>
        <BackButton onPress={() => setScreen(screens.CAMERA)}/>
        <ScanHistory onScanPress={(scan) => {
          setScanFromHistory(scan);
          setScreen(screens.SCAN_RESULTS);
        }}/>
      </ThemedView>
    );
  }

  if (currScreen === screens.SCAN_HISTORY) {
    return render_scan_history();
  } else if (currScreen === screens.LOADING) {
    return render_loading();
  } else if (currScreen === screens.SCAN_PREVIEW) {
    return render_scan_preview();
  } else if (currScreen === screens.SCAN_PROCESSING) {
    return render_scan_processing();
  } else if (currScreen === screens.SCAN_RESULTS) {
    return render_scan_results();
  } else { // Default to camera
    return focused ? render_camera() : render_empty();
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
    zIndex: 10,
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

  scanHistoryButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 120,
    height: 34,
    zIndex: 10,
    borderRadius: 22,
    backgroundColor: '#1c4415',
    justifyContent: 'center',
    alignItems: 'center',
},
});
