import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const numColumns = 3;
const screenWidth = Dimensions.get('window').width;
const itemWidth = screenWidth / numColumns - 16;

const HomeScreen = () => {
  const navigation = useNavigation();

  const [videos, setVideos] = useState([]);
  const [displayedVideos, setDisplayedVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const snapshot = await firestore().collection('videos').get();
        const videoData = snapshot.docs.map(doc => doc.data());
        setVideos(videoData);
        setDisplayedVideos(videoData.slice(0, 20));
      } catch (error) {
        console.error('Lỗi khi lấy video:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  useEffect(() => {
    const filtered = videos.filter(video =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setDisplayedVideos(filtered.slice(0, visibleCount));
  }, [searchTerm, visibleCount, videos]);

  const loadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() =>
        navigation.navigate('VideoScreen', {
          videoUrl: item.videoUrl,
          title: item.title,
          author: item.author,
        })
      }
    >
      <View style={styles.videoThumbnail}>
        {item.thumbnailUrl ? (
          <Image
            source={{ uri: item.thumbnailUrl }}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.thumbnailText}>🎬</Text>
          </View>
        )}
      </View>
      <Text numberOfLines={2} style={styles.title}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm phim..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <FlatList
          data={displayedVideos}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          numColumns={numColumns}
          contentContainerStyle={styles.listContainer}
          ListFooterComponent={
            displayedVideos.length < videos.length && (
              <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
                <Text style={styles.loadMoreText}>Xem thêm</Text>
              </TouchableOpacity>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 12 },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    margin: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  listContainer: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  itemContainer: {
    width: itemWidth,
    margin: 4,
    alignItems: 'center',
  },
  videoThumbnail: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailText: {
    fontSize: 24,
  },
  title: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  },
  loadMoreButton: {
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  loadMoreText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
