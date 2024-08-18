import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  PermissionsAndroid,
  AsyncStorage,
} from 'react-native';
import {colors} from '../config/Colors';
import Feed from '../components/Feed';
import Icon from 'react-native-vector-icons/FontAwesome';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Modal from 'react-native-modal';

export class FeedScreen extends Component {
  state = {
    mediaUri: null,
    mediaList: [],
    isPreviewVisible: false,
    selectedMedia: null,
  };

  async componentDidMount() {
    const mediaList = await AsyncStorage.getItem('mediaList');
    if (mediaList) {
      const parsedList = JSON.parse(mediaList);
      console.log('Loaded media list:', parsedList);
      this.setState({mediaList: parsedList});
    }
  }

  requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message:
            'This app needs access to your storage to save photos and videos.',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  handleCamera = async () => {
    const hasPermission = await this.requestStoragePermission();
    if (!hasPermission) return;

    const options = {
      mediaType: 'mixed',
      quality: 1,
      saveToPhotos: true,
    };
    launchCamera(options, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const {uri} = response.assets[0];
        this.setState(prevState => {
          const updatedMediaList = [...prevState.mediaList, uri];
          console.log('Updated media list:', updatedMediaList);
          AsyncStorage.setItem('mediaList', JSON.stringify(updatedMediaList));
          return {mediaUri: uri, mediaList: updatedMediaList};
        });
      }
    });
  };

  handleLibrary = async () => {
    const options = {
      mediaType: 'mixed',
      quality: 1,
    };
    launchImageLibrary(options, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const {uri} = response.assets[0];
        this.setState({
          selectedMedia: uri,
          isPreviewVisible: true,
        });
      }
    });
  };

  handlePost = () => {
    const {selectedMedia, mediaList} = this.state;
    const updatedMediaList = [...mediaList, selectedMedia];

    this.setState({
      mediaList: updatedMediaList,
      selectedMedia: null,
      isPreviewVisible: false,
    });

    AsyncStorage.setItem('mediaList', JSON.stringify(updatedMediaList));
    console.log('Media posted:', updatedMediaList);
  };

  renderPreviewModal = () => {
    const {selectedMedia} = this.state;

    return (
      <Modal isVisible={this.state.isPreviewVisible}>
        <View style={styles.previewContainer}>
          <Image source={{uri: selectedMedia}} style={styles.previewImage} />
          <View style={styles.previewActions}>
            <TouchableOpacity
              onPress={this.handlePost}
              style={styles.postButton}>
              <Text style={styles.buttonText}>Post</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                this.setState({isPreviewVisible: false, selectedMedia: null})
              }
              style={styles.cancelButton}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  render() {
    const {mediaList} = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={this.handleCamera}>
            <Image
              style={styles.icon}
              source={require('../assets/images/camera.jpg')}
            />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Icon
              name="film"
              size={30}
              color={colors.black}
            />
            <Text style={styles.logoText}>Reels</Text>
          </View>
          <View style={styles.headerRightWrapper}>
            <Image
              style={styles.icon}
              source={require('../assets/images/message.jpg')}
            />
          </View>
        </View>

        <Feed mediaList={mediaList} />

        <View style={styles.footer}>
          <TouchableOpacity onPress={this.handleLibrary}>
            <Icon color={colors.gray} size={25} name="plus-square" />
          </TouchableOpacity>
        </View>

        {this.renderPreviewModal()}
      </View>
    );
  }
}

export default FeedScreen;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomColor: colors.gray1,
    borderBottomWidth: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    borderTopColor: colors.gray1,
    borderTopWidth: 1,
  },
  icon: {
    width: 40,
    height: 40,
  },
  logo: {
    width: 150,
    height: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    marginLeft: 10,
  },
  headerRightWrapper: {
    flexDirection: 'row',
  },
  uploadButton: {
    fontSize: 18,
    color: colors.blue,
  },
  previewContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 300,
    marginBottom: 20,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postButton: {
    backgroundColor: colors.blue,
    padding: 10,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: colors.red,
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
