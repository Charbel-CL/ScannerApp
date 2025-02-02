import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import MlkitOcr from 'react-native-mlkit-ocr';

const OCRScanner = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [editedText, setEditedText] = useState('');
  const devices = useCameraDevices();
  const camera = useRef<Camera | null>(null);
  const device = devices.back;

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      if (status === 'authorized') {
        setHasPermission(true);
      } else {
        Alert.alert('Permission Denied', 'Camera access is required.');
      }
    })();
  }, []);

  const takePhoto = async () => {
    if (camera.current) {
      const photo = await camera.current.takePhoto();
      console.log('Photo Path:', photo.path);

      // Extract numbers using OCR
      const ocrResult = await MlkitOcr.detectFromFile(photo.path);
      const extractedNumbers = ocrResult
        .map(item => item.text.match(/\d+/g))
        .flat()
        .filter(Boolean)
        .join(' ');

      console.log('Extracted Numbers:', extractedNumbers);
      setExtractedText(extractedNumbers);
      setEditedText(extractedNumbers);
    }
  };

  if (!device) return <Text>No camera available</Text>;
  if (!hasPermission) return <Text>Camera permission required</Text>;

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
      />
      <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
        <Text style={styles.captureText}>Capture</Text>
      </TouchableOpacity>

      {/* Display and Edit Extracted Numbers */}
      {extractedText ? (
        <View style={styles.editContainer}>
          <Text style={styles.label}>Extracted Numbers:</Text>
          <TextInput
            style={styles.input}
            value={editedText}
            onChangeText={setEditedText}
            keyboardType="numeric"
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  camera: {flex: 1, width: '100%'},
  captureButton: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 50,
  },
  captureText: {color: 'white', fontSize: 18},
  editContainer: {
    position: 'absolute',
    bottom: 100,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    width: '80%',
  },
  label: {fontSize: 16, fontWeight: 'bold'},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginTop: 5,
    fontSize: 18,
  },
});

export default OCRScanner;
