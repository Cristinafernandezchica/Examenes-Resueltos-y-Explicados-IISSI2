import React, { useEffect, useState } from 'react'
import { getAll2 } from '../../api/RestaurantEndpoints'
import { get3MorePopularProducts } from '../../api/ProductEndpoints'
import { StyleSheet, FlatList, Pressable, View } from 'react-native'
import TextSemiBold from '../../components/TextSemibold'
import TextRegular from '../../components/TextRegular'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { showMessage } from 'react-native-flash-message'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import ImageCard from '../../components/ImageCard'
import defaultProductImage from '../../../assets/product.jpeg'

export default function RestaurantsScreen ({ navigation, route }) {
  const [restaurants, setRestaurants] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    async function fetchRestaurants () {
      try {
        const fetchedRestaurants = await getAll2()
        setRestaurants(fetchedRestaurants)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving restaurants. ${error} `,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchRestaurants()

    async function fetchPopularProducts () {
      try {
        const fetchedProducts = await get3MorePopularProducts()
        setProducts(fetchedProducts)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving Products. ${error} `,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }

    fetchPopularProducts()
  }, [route])

  const renderRestaurant = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.logo ? { uri: process.env.API_BASE_URL + '/' + item.logo } : restaurantLogo}
        title={item.name}
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', { id: item.id })
        }}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        {item.averageServiceMinutes !== null &&
          <TextSemiBold>Avg. service time: <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>{item.averageServiceMinutes} min.</TextSemiBold></TextSemiBold>
        }
        <TextSemiBold>Shipping: <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>{item.shippingCosts.toFixed(2)}€</TextSemiBold></TextSemiBold>
        <View style={styles.actionButtonsContainer}>
          <Pressable
            onPress={() => navigation.navigate('EditRestaurantScreen', { id: item.id })
            }
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandBlueTap
                  : GlobalStyles.brandBlue
              },
              styles.actionButton
            ]}>
        </Pressable>
        </View>
      </ImageCard>
    )
  }

  const renderPopularProducts = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : defaultProductImage}
        title={item.name}
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', { id: item.restaurantId })
        }}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
        {!item.availability &&
          <TextRegular textStyle={styles.availability }>Not available</TextRegular>
        }
      </ImageCard>
    )
  }

  const renderHeader = ({ item }) => {
    return (<>
      <TextSemiBold textStyle={styles.section_title}>
      Popular products </TextSemiBold>
      <FlatList
        horizontal= {true}
        contentContainerStyle={[styles.container, styles.prod_mas_populares]}
        data={products}
        renderItem={renderPopularProducts}
        keyExtractor={item => item.id.toString()}
      />
      <TextSemiBold textStyle={styles.section_title}>
      Restaurants </TextSemiBold>
    </>
    )
  }

  return (
    <FlatList
      ListHeaderComponent={renderHeader}
      contentContainerStyle={[styles.layout]}
      data={restaurants}
      renderItem={renderRestaurant}
      keyExtractor={r => r.id.toString()}
    />
  )
}

const styles = StyleSheet.create({
  section_title: {
    fontSize: 30,
    marginTop: 40,
    textAlign: 'center',
    fontWeight: 600
  },
  prod_mas_populares: {
    justifyContent: 'space-around'
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5
  },
  button: {
    borderRadius: 8,
    height: 40,
    margin: 12,
    padding: 10,
    width: '100%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  availability: {
    textAlign: 'center',
    fontSize: 20,
    fontStyle: 'italic',
    marginRight: 70,
    color: 'red'
  }
})
