import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Video from 'react-native-video';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore'; // hoặc dùng firebase v9 nếu bạn dùng Firebase JS SDK

const VideoScreen = ({ route }) => {
  const { videoUrl, title, author } = route.params;
  const navigation = useNavigation();

  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const snapshot = await firestore().collection('videos').get(); // nếu dùng JS SDK thì dùng: firebase.firestore().collection('videos').get()
        const allVideos = snapshot.docs.map(doc => doc.data());

        // Lọc ra các video không trùng video hiện tại
        const filtered = allVideos.filter(video => video.videoUrl !== videoUrl);
        
        // Trộn ngẫu nhiên và lấy 5 video
        const randomFive = filtered.sort(() => 0.5 - Math.random()).slice(0, 5);

        setRelatedVideos(randomFive);
      } catch (error) {
        console.error('Lỗi khi lấy video từ Firestore:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [videoUrl]);

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: encodeURI(videoUrl) }}
        style={styles.video}
        controls
        resizeMode="contain"
      />

      <ScrollView style={styles.infoContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.author}>{author}</Text>

        <Text style={styles.relatedHeader}>Các phim khác</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          relatedVideos.map((video, index) => (
            <TouchableOpacity
              key={index}
              style={styles.relatedItem}
              onPress={() =>
                navigation.push('VideoScreen', {
                  videoUrl: video.videoUrl,
                  title: video.title,
                  author: video.author,
                })
              }
            >
              <Text style={styles.relatedTitle}>{video.title}</Text>
              <Text style={styles.relatedAuthor}>{video.author}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  video: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.5,
  },
  infoContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  author: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  relatedHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
    color: '#000',
  },
  relatedItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  relatedTitle: {
    fontSize: 16,
    color: '#000',
  },
  relatedAuthor: {
    fontSize: 14,
    color: '#777',
  },
});

export default VideoScreen;
