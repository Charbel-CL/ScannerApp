import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  CameraOptions,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';

const OCRScanner = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [editedText, setEditedText] = useState<string>('');

  const selectImage = async (useCamera: boolean) => {
    const options: CameraOptions & ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 1,
      saveToPhotos: true, 
    };

    const result = useCamera ? await launchCamera(options) : await launchImageLibrary(options);

    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert('Error', result.errorMessage || 'Something went wrong.');
      return;
    }

    if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
      const uri = result.assets[0].uri ?? '';
      setImageUri(uri);
      extractText(uri);
    } else {
      Alert.alert('Error', 'No image selected.');
    }
  };

  const extractText = async (uri: string) => {
    try {
      const result = await TextRecognition.recognize(uri);
      const extractedNumbers = result.text.match(/\d+/g)?.join(' ') || 'No numbers found';
      setExtractedText(extractedNumbers);
      setEditedText(extractedNumbers);
    } catch (error) {
      Alert.alert('OCR Error', 'Failed to extract numbers.');
      console.error(error);
    }
  };

  const removeImage = () => {
    setImageUri(null);
    setExtractedText('');
    setEditedText('');
  };

  return (
    <View style={styles.container}>
      {!imageUri ? (
        <>
          <TouchableOpacity style={styles.button} onPress={() => selectImage(true)}>
            <Text style={styles.buttonText}>Take a Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => selectImage(false)}>
            <Text style={styles.buttonText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <TouchableOpacity style={styles.closeButton} onPress={removeImage}>
            <Text style={styles.closeButtonText}>✖ Remove Image</Text>
          </TouchableOpacity>
        </>
      )}

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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontSize: 18 },

  image: {
    width: 200,
    height: 200,
    marginVertical: 15,
    borderRadius: 8,
    resizeMode: 'contain',
  },

  closeButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    width: '50%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },

  editContainer: { marginTop: 15, width: '80%' },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    fontSize: 16,
    borderRadius: 5,
  },
});

export default OCRScanner;
