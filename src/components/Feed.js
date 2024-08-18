import React, {useState, useRef, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Image,
  FlatList,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  ScrollView,
  Platform,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Video from 'react-native-video';
import {colors} from '../config/Colors';

const Feed = ({mediaList}) => {
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [playingIndex, setPlayingIndex] = useState(null);

  const handleLike = index => {
    setLikes(prevLikes => {
      const updatedLikes = {...prevLikes};
      if (updatedLikes[index]) {
        delete updatedLikes[index];
      } else {
        updatedLikes[index] = true;
      }
      return updatedLikes;
    });
  };

  const handleComment = index => {
    setCurrentIndex(index);
    setModalVisible(true);
  };

  const addComment = () => {
    if (newComment.trim() === '') return;

    setComments(prevComments => {
      const updatedComments = {...prevComments};
      if (!updatedComments[currentIndex]) {
        updatedComments[currentIndex] = [];
      }
      updatedComments[currentIndex].push(newComment);
      return updatedComments;
    });

    setNewComment('');
    setModalVisible(false);
  };

  const handleShare = async item => {
    try {
      const result = await Share.share({
        message: item, // Customize the message here
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing:', error.message);
    }
  };

  const handleViewableItemsChanged = useCallback(({viewableItems}) => {
    const visibleItemIndex = viewableItems.findIndex(({item}) =>
      item.endsWith('.mp4'),
    );
    if (visibleItemIndex !== -1) {
      setPlayingIndex(viewableItems[visibleItemIndex].index);
    } else {
      setPlayingIndex(null);
    }
  }, []);

  const renderItem = ({item, index}) => {
    const liked = !!likes[index];
    const commentList = comments[index] || [];
    const commentCount = commentList.length;

    return (
      <View style={styles.feedItem}>
        {item.endsWith('.mp4') ? (
          <Video
            source={{uri: item}}
            style={styles.feedMedia}
            resizeMode="cover"
            paused={playingIndex !== index}
            repeat={true}
            onError={error => console.log('Video Error:', error)}
          />
        ) : (
          <Image style={styles.feedMedia} source={{uri: item}} />
        )}
        <View style={styles.feedImageFooter}>
          <View style={styles.feedImageFooterLeftWrapper}>
            <TouchableOpacity onPress={() => handleLike(index)}>
              <Icon
                name={liked ? 'heart' : 'heart-o'}
                size={30}
                color={liked ? colors.red : colors.black}
                style={styles.icon}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleComment(index)}>
              <Icon
                name="comment-o"
                size={30}
                color={colors.black}
                style={styles.icon}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleShare(item)}>
              <Icon
                name="paper-plane"
                size={30}
                color={colors.black}
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>
          <Icon name="bookmark-o" size={30} color={colors.black} />
        </View>
        <View style={styles.underLineWrapper}>
          <View style={styles.underLine} />
        </View>
        <View style={styles.likesAndCommentsWrapper}>
          <Icon
            name={liked ? 'heart' : 'heart-o'}
            size={25}
            color={liked ? colors.red : colors.black}
          />
          <Text style={styles.likesTitle}>
            {Object.keys(likes).filter(key => key == index).length} Likes
          </Text>
          <Text style={styles.likesTitle}>{commentCount} Comments</Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <FlatList
        data={mediaList}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{itemVisiblePercentThreshold: 50}}
      />

      {/* Comment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.modalView}>
          <ScrollView style={styles.modalContent}>
            {currentIndex !== null &&
              comments[currentIndex] &&
              comments[currentIndex].map((comment, index) => (
                <Text key={index} style={styles.commentText}>
                  {comment}
                </Text>
              ))}
          </ScrollView>
          <TextInput
            style={styles.textInput}
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={setNewComment}
          />
          <View style={styles.buttonContainer}>
            <Button title="Add Comment" onPress={addComment} />
            <Button
              title="Cancel"
              onPress={() => {
                setModalVisible(false);
                setNewComment('');
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Feed;

const styles = StyleSheet.create({
  feedItem: {
    marginBottom: 10,
  },
  feedMedia: {
    width: '100%',
    height: 300,
  },
  feedImageFooter: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feedImageFooterLeftWrapper: {
    flexDirection: 'row',
  },
  icon: {
    marginRight: 15,
  },
  underLine: {
    height: 1,
    backgroundColor: colors.gray1,
  },
  underLineWrapper: {
    marginLeft: 10,
    marginRight: 10,
  },
  likesAndCommentsWrapper: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  likesTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContent: {
    width: '100%',
    marginBottom: 20,
  },
  commentText: {
    fontSize: 16,
    marginBottom: 10,
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderBottomWidth: 1,
    width: '100%',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});
