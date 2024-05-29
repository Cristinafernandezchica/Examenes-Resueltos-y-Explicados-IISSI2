import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, ImageBackground, Image, Pressable } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { getDetail } from '../../api/RestaurantEndpoints'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import defaultProductImage from '../../../assets/product.jpeg'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { create } from '../../api/OrderEndpoints'
import ConfirmOrderModal from '../../components/ConfirmOrderModal'
import DismissOrderModal from '../../components/DismissOrderModal'

export default function RestaurantDetailScreen ({ navigation, route }) {
  const { loggedInUser } = useContext(AuthorizationContext)
  const [restaurant, setRestaurant] = useState({})
  const [backendErrors, setBackendErrors] = useState()
  const [products, setProducts] = useState([])
  const [productQuantity, setProductQuantity] = useState(new Map())
  const [orderToBeConfirmed, setOrderToBeConfirmed] = useState(null)
  const [productsInOrder, setProducstInOrder] = useState([])
  const [dismissOrder, setDismissOrder] = useState(false)
  const [address, setAddress] = useState('')

  useEffect(() => {
    fetchRestaurantProductDetail()
  }, [loggedInUser, route])

  const fetchRestaurantProductDetail = async () => {
    try {
      const fetchedRestaurant = await getDetail(route.params.id)
      const productos = fetchedRestaurant.products
      setRestaurant(fetchedRestaurant)
      setProducts(productos)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurant details (id ${route.params.id}). ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  useEffect(() => {
    // eslint-disable-next-line no-prototype-builtins
    if (restaurant.hasOwnProperty('products')) {
      restaurant.products.forEach(element => {
        setProductQuantity(productQuantity.set(element.id, 0))
      })
    }
  }, [restaurant])

  useEffect(() => {
    const productsNewOrder = products.filter(p => productQuantity.get(p.id) > 0)
    setProducstInOrder(productsNewOrder)
  }, [orderToBeConfirmed])

  const confirmOrder = async () => {
    const productQuantityReshaped = [...productQuantity].map(([productId, quantity]) => ({ productId, quantity }))
      .filter(element => element.quantity > 0)
    if (productQuantityReshaped.length > 0) {
      const values = { address, restaurantId: route.params.id, products: productQuantityReshaped }
      await setOrderToBeConfirmed(values)
    } else {
      showMessage({
        message: 'Select at least one product to confirm an order',
        type: 'danger',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderHeader = () => {
    return (
      <View>
        <ImageBackground source={(restaurant?.heroImage) ? { uri: process.env.API_BASE_URL + '/' + restaurant.heroImage, cache: 'force-cache' } : undefined} style={styles.imageBackground}>
          <View style={styles.restaurantHeaderContainer}>
            <TextSemiBold textStyle={styles.textTitle}>{restaurant.name}</TextSemiBold>
            <Image style={styles.image} source={restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + restaurant.logo, cache: 'force-cache' } : undefined} />
            <TextRegular textStyle={styles.description}>{restaurant.description}</TextRegular>
            <TextRegular textStyle={styles.description}>{restaurant.restaurantCategory ? restaurant.restaurantCategory.name : ''}</TextRegular>
          </View>
        </ImageBackground>

        <Pressable
          onPress={ () => {
            if (loggedInUser) {
              setAddress(loggedInUser.address)
              confirmOrder()
            } else {
              showMessage({
                message: 'You must be logged in to place an order',
                type: 'danger',
                style: GlobalStyles.flashStyle,
                titleStyle: GlobalStyles.flashTextStyle
              })
              navigation.navigate('Profile')
            }
          }}
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? GlobalStyles.brandSuccessTap
                : GlobalStyles.brandSuccess
            },
            styles.button
          ]}>
          <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
            <MaterialCommunityIcons name='plus-circle' color={'white'} size={20} />
            <TextRegular textStyle={styles.text}>
              Confirm order
            </TextRegular>
          </View>
          </Pressable>
          <Pressable
            onPress={() => setDismissOrder(true)}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandPrimary
                  : GlobalStyles.brandPrimary
              },
              styles.button
            ]}>
            <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
              <MaterialCommunityIcons name='minus-circle' color={'white'} size={20} />
              <TextRegular textStyle={styles.text}>
                Dismiss order
              </TextRegular>
            </View>
          </Pressable>
      </View>
    )
  }

  const renderProduct = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : defaultProductImage}
        title={item.name}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
        {item.availability &&
            <View style={styles.actionButtonsContainer}>
              <Pressable
                onPress={() => {
                  if (productQuantity.get(item.id) > 0) {
                    const newProductQuantity = productQuantity.set(item.id, productQuantity.get(item.id) - 1)
                    setProductQuantity(newProductQuantity)
                    setProducts([...products])
                  }
                }
                }
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? GlobalStyles.brandPrimary
                      : GlobalStyles.brandPrimary
                  },
                  styles.actionButton
                ]}>
                <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                  <MaterialCommunityIcons name='minus-circle' color={'white'} size={20} />
                </View>
              </Pressable>
              <View style={styles.quantityBorder}>
                <TextRegular textStyle={[{ justifyContent: 'space-around', alignSelf: 'center' }]}>
                  {productQuantity.get(item.id)}
                </TextRegular>
              </View>
              <Pressable
                onPress={() => {
                  const newProductQuantity = productQuantity.set(item.id, productQuantity.get(item.id) + 1)
                  setProductQuantity(newProductQuantity)
                  setProducts([...products])
                }
                }
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? GlobalStyles.brandGreenTap
                      : GlobalStyles.brandGreen
                  },
                  styles.actionButton
                ]}>
                <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                  <MaterialCommunityIcons name='plus-circle' color={'white'} size={20} />
                </View>
              </Pressable>
            </View>
        }
        {!item.availability &&
          <View style={styles.actionButtonsContainer}>
            <TextRegular textStyle={styles.availability}numberOfLines={6}>Not available</TextRegular>
          </View>
        }
      </ImageCard>
    )
  }

  const renderEmptyProductsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        This restaurant has no products yet.
      </TextRegular>
    )
  }

  const createOrder = async (values) => {
    setBackendErrors([])
    try {
      values.address = address
      await create(values)
      showMessage({
        message: 'Order succesfully created',
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      navigation.navigate('My Orders', { dirty: true })
    } catch (error) {
      setBackendErrors(error.errors)
      showMessage({
        message: `Problems while creating a new order: ${backendErrors}`,
        type: 'danger',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  return (
    <>
      <ConfirmOrderModal
        shippingCosts={restaurant.shippingCosts}
        data={productsInOrder}
        quantities={productQuantity}
        isVisible={orderToBeConfirmed !== null}
        onCancel={() => setOrderToBeConfirmed(null)}
        onConfirm={() => {
          createOrder(orderToBeConfirmed)
          setOrderToBeConfirmed(null)
        }}
        addr={address}
        setAddr={setAddress}>
      </ConfirmOrderModal>
      <DismissOrderModal
        isVisible={dismissOrder === true}
        onCancel={() => setDismissOrder(false)}
        onConfirm={() => {
          restaurant.products.forEach(element => {
            setProductQuantity(productQuantity.set(element.id, 0))
          })
          setProducts([...products])
          setDismissOrder(false)
        }
        }>
      </DismissOrderModal>
      <FlatList
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyProductsList}
          style={styles.container}
          data={products}
          renderItem={renderProduct}
          keyExtractor={item => item.id.toString()}
        />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  row: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: GlobalStyles.brandSecondary
  },
  restaurantHeaderContainer: {
    height: 250,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'column',
    alignItems: 'center'
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center'
  },
  image: {
    height: 100,
    width: 100,
    margin: 10
  },
  description: {
    color: 'white'
  },
  textTitle: {
    fontSize: 20,
    color: 'white'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '80%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  availability: {
    textAlign: 'center',
    fontSize: 20,
    fontStyle: 'Arial',
    marginRight: 70,
    color: GlobalStyles.brandPrimary
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    width: '25%',
    margin: '1%'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    width: '90%',
    alignSelf: 'center',
    marginTop: 30,
    justifyContent: 'flex-end'
  },
  quantityBorder: {
    border: 'solid',
    marginTop: 5,
    borderRadius: 8,
    height: 40,
    padding: 10,
    width: '4%',
    margin: '1%',
    justifyContent: 'space-around',
    alignSelf: 'center'
  }
})
