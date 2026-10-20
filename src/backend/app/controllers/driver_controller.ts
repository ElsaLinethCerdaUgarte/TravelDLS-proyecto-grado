import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import DriverService from '#services/driver_service'
import CloudinaryService from '#services/cloudinary_service'
import { createDriverValidator, updateDriverValidator } from '#validators/driver_validator'
import { DriverStatus } from '#enums/driver_status'

@inject()
export default class DriversController {
  constructor(
    private driverService: DriverService,
    private cloudinaryService: CloudinaryService
  ) {}

  /**
   * @index
   * @description Lists all drivers with pagination
   * @tag Drivers
   * @paramQuery page - Page number - @type(number)
   * @paramQuery perPage - Items per page - @type(number)
   * @paramQuery status - Optional driver status - @type(string)
   * @paramQuery idCompany - Optional company ID - @type(number)
   * @paramQuery search - Optional search by license or user name - @type(string)
   * @responseBody 200 - Paginador de conductores
   */
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 10)
    const status = request.input('status')
    const idCompany = request.input('idCompany')
    const search = request.input('search')
    const hasTruck = request.input('hasTruck') === 'true'
    const availableForOrders = request.input('availableForOrders') === 'true'

    try {
      const drivers = await this.driverService.list({
        page,
        perPage,
        status,
        idCompany,
        search,
        hasTruck,
        availableForOrders,
      })
      return response.ok(drivers)
    } catch {
      return response.internalServerError({ message: 'Failed to retrieve drivers.' })
    }
  }

  /**
   * @show
   * @description Finds a driver by ID
   * @tag Drivers
   * @paramPath id - Driver ID - @type(number) @required
   * @responseBody 200 - Objeto de conductor
   * @responseBody 404 - Driver not found
   */
  async show({ params, response }: HttpContext) {
    try {
      const driver = await this.driverService.findById(params.id)
      return response.ok(driver)
    } catch {
      return response.notFound({ message: 'Driver not found.' })
    }
  }

  /**
   * @store
   * @description Creates a new driver. Accepts multipart/form-data with an optional photo file.
   * @tag Drivers
   * @requestFormDataBody { "idCompany": "number", "userId": "number", "license": "string", "passport": "string", "photo": "file?", "status": "string?" }
   * @responseBody 201 - <Driver>
   * @responseBody 422 - Validation failed
   */
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(createDriverValidator)

    try {
      // Si el frontend envió una foto, la subimos a Cloudinary y obtenemos la URL.
      // La URL resultante (photoUrl) es la que se guarda en la BD — las tablas NO cambian.
      let photoUrl: string | undefined
      if (data.photo) {
        const result = await this.cloudinaryService.upload(data.photo, 'travelDLS/drivers')
        photoUrl = result.secureUrl
      }

      const driver = await this.driverService.create({
        data: {
          idCompany: data.idCompany,
          userId: data.userId,
          license: data.license,
          passport: data.passport,
          photoUrl,
          status: data.status || DriverStatus.OFFLINE,
        },
      })
      return response.created(driver)
    } catch (error: any) {
      return response.unprocessableEntity({ message: error.message })
    }
  }

  /**
   * @update
   * @description Updates an existing driver. Accepts multipart/form-data with an optional photo file.
   * @tag Drivers
   * @paramPath id - Driver ID - @type(number) @required
   * @requestFormDataBody { "idCompany": "number?", "userId": "number?", "license": "string?", "passport": "string?", "photo": "file?", "status": "string?" }
   * @responseBody 200 - <Driver>
   * @responseBody 404 - Driver not found
   * @responseBody 422 - Validation failed
   */
  async update({ params, request, response }: HttpContext) {
    const data = await request.validateUsing(updateDriverValidator)

    try {
      // Si el frontend envió una foto nueva, la subimos a Cloudinary.
      // Solo se incluye photoUrl en el update si realmente se mandó una foto.
      let photoUrl: string | undefined
      if (data.photo) {
        const result = await this.cloudinaryService.upload(data.photo, 'travelDLS/drivers')
        photoUrl = result.secureUrl
      }

      const driver = await this.driverService.update(params.id, {
        idCompany: data.idCompany,
        userId: data.userId,
        license: data.license,
        passport: data.passport,
        ...(photoUrl !== undefined && { photoUrl }),
        status: data.status,
      })
      return response.ok(driver)
    } catch (error: any) {
      if (error.message === 'Driver not found.') {
        return response.notFound({ message: error.message })
      }
      return response.unprocessableEntity({ message: error.message })
    }
  }

  /**
   * @destroy
   * @description Soft-deletes a driver
   * @tag Drivers
   * @paramPath id - Driver ID - @type(number) @required
   * @responseBody 200 - { "message": "Driver deleted successfully." }
   * @responseBody 404 - Driver not found
   */
  async destroy({ params, response }: HttpContext) {
    try {
      await this.driverService.softDelete(params.id)
      return response.ok({ message: 'Driver deleted successfully.' })
    } catch {
      return response.notFound({ message: 'Driver not found.' })
    }
  }
}
