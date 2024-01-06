import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import * as Location from 'expo-location';
import { Fontisto } from "@expo/vector-icons";

// Dimensions를 이용하면 화면 크기를 얻을 수 있다.

const API_KEY = "147271a7f8e7975e2c0538846c1e51a3";
// git에 올릴 때는 삭제할 것
// API키를 어플에 올리는 건 위험

const { width:SCREEN_WIDTH } = Dimensions.get('window');

const icons = {
  Clouds: "cloudy",
  Clear: "day-sunny",
  Atmosphere: "cloudy-gusts",
  Snow: "snow",
  Rain: "rains",
  Drizzle: "rain",
  Thunderstorm: "lightning",
};


export default function App() {
  const [city, setCity] = useState("Loading...");
  const [days, setDays] = useState([]);
  const [temperature, setTemperature] = useState({})
  const [ok, setOk] = useState(true);
  const ask = async () => {
    const {granted} = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      setOk(false);
    }
    // 가져온 데이터를 그대로 꺼내오는 문법
    const {coords: {latitude, longitude}} = await Location.getCurrentPositionAsync({accuracy:5});
    const location = await Location.reverseGeocodeAsync({latitude, longitude}, {useGoogleMaps:false});
    if (location[0].city) {
      // 타입가드
      setCity(location[0].city);
    }
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
    const json = await response.json();
    setTemperature(json.main.temp);
    setDays(json.weather);
  }
  useEffect(() => {
    ask();
  }, [])
  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>

      {/* ScrollView에서는 style이 아니라 contentContainerStyle 사용 */}
      {/* 스크롤을 가로로 할 수 있게하는 props: horizental */}
      {/* 스크롤을 끝까지 당겨야 넘어갈 수 있는 props: pagingEnabled */}
      {/* 공식문서에 더 많은 기능이 있으니 참고 */}
      <ScrollView 
      horizontal
      pagingEnabled 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.weather}>
        <View style={styles.day}>
          {/* 로딩 중인 표시가 뜸 */}
          {/* api 오류 문제로 다른 것을 사용 */}
          {/* 추후 수정 */}
          { days.length === 0 ?
            (<View style={styles.day}>
              <ActivityIndicator size="large"/> 
            </View>) :
            (
              days.map((day, index) =>
              <View key={index} style={styles.day}>
                <Text style={styles.temp}>{parseFloat(temperature).toFixed(1)}</Text>
                <Text style={styles.description}>{day.main}</Text>
                <Text style={styles.tinyText}>{day.description}</Text>
                <Fontisto
                  name={icons[day.main]}
                  size={68}
                  color="black"
                />
              </View>
              )
            )
            }
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor:'#aaaaaa'
  },
  city: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // back
  },
  cityName: {
    fontSize: 68,
    fontWeight: '500',
    color: "black"
  },
   weather: {
    // flex: 3 // ScrollView는 화면보다 커야해서(스크린을 넘겨서 스크롤할 수 있어야 하기 때문에) Flex가 없어야 함
   },
   day: {
    width: SCREEN_WIDTH,
    marginLeft: 15
    // alignItems: 'center'
   },
   temp: {
    marginTop:50,
    fontSize: 158,
    color: "black"
   },
   description: {
    marginTop: -30,
    fontSize: 25,
    color: "black"
  },
  tinyText: {
    color: "black",
    fontSize: 20
  }
})

// 모든 View는 Flex container, default flex direction은 column
// 대부분의 경우 너비와 높이에 기반해서 레이아웃을 만들지 않을 것
// 스크린 사이즈에 따라 다르기 때문
// flex 부모를 만들고 자식을 원하는 비율로 조절할 수 있다.