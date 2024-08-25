import { useState, useEffect } from 'react';
import { StyleSheet, View, Image, FlatList, Dimensions, Modal, TouchableOpacity, Text } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';



export default function Collections() {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  useEffect(() => {
    const dummyImages = Array(20).fill(null).map((_, index) => ({
      id: index.toString(),
      uri: `https://picsum.photos/200/300?random=${index}`
    }));
    setImages(dummyImages);
  }, []);

  const toggleImageSelection = (imageUri) => {
    setSelectedImages(prevSelected => {
      if (prevSelected.includes(imageUri)) {
        return prevSelected.filter(uri => uri !== imageUri);
      } else {
        return [...prevSelected, imageUri];
      }
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.imageContainer,
        selectedImages.includes(item.uri) && styles.selectedImageContainer
      ]}
      onPress={() => isMultiSelectMode ? toggleImageSelection(item.uri) : setSelectedImage(item.uri)}
      onLongPress={() => {
        setIsMultiSelectMode(true);
        toggleImageSelection(item.uri);
      }}
    >
      <Image source={{ uri: item.uri }} style={styles.image} />
      {isMultiSelectMode && selectedImages.includes(item.uri) && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const saveSelectedImages = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('需要访问相册权限来保存图片');
        return;
      }

      for (const imageUri of selectedImages) {
        const fileUri = FileSystem.documentDirectory + 'temp_image.jpg';
        await FileSystem.downloadAsync(imageUri, fileUri);
        await MediaLibrary.saveToLibraryAsync(fileUri);
      }

      alert('选中的图片已保存到相册');
      setSelectedImages([]);
      setIsMultiSelectMode(false);
    } catch (error) {
      console.error('保存图片时出错:', error);
      alert('保存图片时出错');
    }
  };

  return (
    <View style={styles.container}>
      {isMultiSelectMode && (
        <View style={styles.multiSelectHeader}>
          <Text>已选择 {selectedImages.length} 张图片</Text>
          <TouchableOpacity onPress={saveSelectedImages} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>保存</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            setIsMultiSelectMode(false);
            setSelectedImages([]);
          }} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>取消</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.imageGrid}
      />
      <Modal
        visible={!!selectedImage}
        transparent={true}
        onRequestClose={() => setSelectedImage(null)}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          onPress={() => setSelectedImage(null)}
        >
          <Image source={{ uri: selectedImage }} style={styles.fullImage} />
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const { width, height } = Dimensions.get('window');
const imageSize = width / 3 - 8;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  imageGrid: {
    padding: 4,
  },
  imageContainer: {
    padding: 4,
    position: 'relative',
  },
  selectedImageContainer: {
    opacity: 0.7,
  },
  image: {
    width: imageSize,
    height: imageSize * 1.5,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  fullImage: {
    width: width,
    height: height * 0.8,
    resizeMode: 'contain',
  },
  checkmark: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 18,
  },
  multiSelectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    color: 'white',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: 'white',
  },
});
