import type { HttpContext } from '@adonisjs/core/http'
import OrderTracking from '#models/order_tracking'

export default class OrderTrackingsController {
  public async store({ request, params, response }: HttpContext) {
    const orderId = params.id
    const { latitude, longitude } = request.only(['latitude', 'longitude'])

    let tracking = await OrderTracking.findBy('orderId', orderId)

    if (tracking) {
      tracking.latitude = latitude
      tracking.longitude = longitude
      await tracking.save()
    } else {
      tracking = await OrderTracking.create({ orderId, latitude, longitude })
    }

    return response.json(tracking)
  }

  public async show({ params, response }: HttpContext) {
    const tracking = await OrderTracking.findBy('orderId', params.id)
    
    if (!tracking) {
      return response.notFound({ message: 'Ubicación no encontrada para esta orden' })
    }
    
    return response.json(tracking)
  }
}