import React, { useEffect, useState, useContext } from 'react'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { StyleSheet, View, FlatList, ImageBackground, Image, Pressable } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { getDetail } from '../../api/RestaurantEndpoints'
import { update, getOrderDetail } from '../../api/OrderEndpoints'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import defaultProductImage from '../../../assets/product.jpeg'
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons'
import ConfirmOrderModal from '../../components/ConfirmOrderModal'
import CancelEditModal from '../../components/CancelEditModal'

export default function EditOrderScreen ({ navigation, route }) {
  const { loggedInUser } = useContext(AuthorizationContext)
  const [restaurant, setRestaurant] = useState({})
  const [backendErrors, setBackendErrors] = useState()
  const [products, setProducts] = useState([])
  const [productQuantity, setProductQuantity] = useState(new Map())
  const [orderToBeConfirmed, setOrderToBeConfirmed] = useState(null)
  const [productsInOrder, setProducstInOrder] = useState([])
  const [cancelEditOrder, setCancelEditOrder] = useState(false)
  const [originalOrder, setOriginalOrder] = useState([])
  const [address, setAddress] = useState('')

  useEffect(() => {
    fetchAll()
  }, [route, loggedInUser])

  useEffect(() => {
    const productsNewOrder = products.filter(p => productQuantity.get(p.id) > 0)
    setProducstInOrder(productsNewOrder)
  }, [orderToBeConfirmed])

  const confirmOrder = async () => {
    const productQuantityReshaped = [...productQuantity].map(([productId, quantity]) => ({ productId, quantity }))
      .filter(element => element.quantity > 0)
    if (productQuantityReshaped.length > 0) {
      const values = {
        address,
        products: productQuantityReshaped
      }
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
              confirmOrder()
            } else {
              showMessage({
                message: 'You must be logged in to place an order ',
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
                ? GlobalStyles.brandGreenTap
                : GlobalStyles.brandGreen
            },
            styles.button
          ]}>
          <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
          <MaterialCommunityIcons name='pencil' color={'white'} size={20}/>
              <TextRegular textStyle={styles.text}>
                Edit
              </TextRegular>
          </View>
        </Pressable>
        <Pressable
          onPress={() => setCancelEditOrder(true)}
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? GlobalStyles.brandPrimaryTap
                : GlobalStyles.brandPrimary
            },
            styles.button
          ]}>
          <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
            <AntDesign name='back' color='white' size={20} />
            <TextRegular textStyle={styles.text}>
              Cancel edit and go back
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
                      ? GlobalStyles.brandPrimaryTap
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

  const fetchAll = async () => {
    try {
      const fetchedRestaurant = await getDetail(route.params.id)
      const productos = fetchedRestaurant.products
      const fetchedOrder = await getOrderDetail(route.params.orderId)
      setAddress(fetchedOrder.address)
      setOriginalOrder(fetchedOrder)
      setRestaurant(fetchedRestaurant)
      setProducts(productos)
      fetchedRestaurant.products.forEach(element => {
        setProductQuantity(productQuantity.set(element.id, 0))
      })
      fetchedOrder.products.forEach(p => {
        setProductQuantity(productQuantity.set(p.id, p.OrderProducts.quantity))
      })
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving details. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const updateOrder = async (values) => {
    setBackendErrors([])
    try {
      values.address = address
      await update(originalOrder.id, values)
      showMessage({
        message: 'Order succesfully updated',
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      navigation.navigate('OrdersScreen', { dirty: false })
    } catch (error) {
      console.log(error)
      setBackendErrors(error.errors)
      showMessage({
        message: `Problems while updating the order: ${backendErrors}`,
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
          updateOrder(orderToBeConfirmed)
          setOrderToBeConfirmed(null)
        }}
        addr={address}
        setAddr={setAddress}
        >

      </ConfirmOrderModal>
      <CancelEditModal
        isVisible={cancelEditOrder === true}
        onCancel={() => setCancelEditOrder(false)}
        onConfirm={() => {
          setCancelEditOrder(false)
          navigation.navigate('OrdersScreen', { dirty: false })
        }
        }>
      </CancelEditModal>
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
    fontStyle: 'italic',
    marginRight: 70,
    color: 'red'
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 5,
    padding: 10,
    alignSelf: 'end',
    flexDirection: 'row',
    width: '4%',
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
