import { mongooseAdapter } from '@payloadcms/db-mongodb'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'
import { vi } from 'payload/i18n/vi'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

import { Branches } from './collections/Branches'
import { Rooms } from './collections/Rooms'
import { Bookings } from './collections/Bookings'
import { Testimonials } from './collections/Testimonials'
import { SiteSettings } from './SiteSettings/config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      // beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      // beforeDashboard: ['@/components/BeforeDashboard'],
      graphics: {
        Logo: '@/components/Graphics/Logo',
        Icon: '@/components/Graphics/Icon',
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  i18n: {
    supportedLanguages: { vi },
    translations: {
      vi: {
        'plugin-ecommerce': {
          productPriceDescription:
            'Giá này cũng sẽ được sử dụng để sắp xếp và lọc sản phẩm. Nếu bạn đã bật biến thể, bạn có thể nhập giá thấp nhất hoặc trung bình để hỗ trợ tìm kiếm và lọc, nhưng giá này sẽ không được sử dụng khi thanh toán.',
          priceIn: 'Giá ({{currency}})',
          enableCurrencyPrice: 'Bật giá {{currency}}',
          priceNotSet: 'Giá chưa được đặt.',
          priceSetInVariants: 'Giá được đặt trong biến thể.',
          currencyNotSet: 'Tiền tệ chưa được đặt.',
          addressesCollectionDescription:
            'Địa chỉ được liên kết với khách hàng và được sử dụng để điền trước thông tin vận chuyển và thanh toán khi đặt hàng.',
          customer: 'Khách hàng',
          addressTitle: 'Danh xưng',
          addressFirstName: 'Tên',
          addressLastName: 'Họ',
          addressCompany: 'Công ty',
          addressLine1: 'Địa chỉ 1',
          addressLine2: 'Địa chỉ 2',
          addressCity: 'Thành phố',
          addressState: 'Tỉnh/Thành',
          addressPostalCode: 'Mã bưu điện',
          addressCountry: 'Quốc gia',
          addressPhone: 'Điện thoại',
          addresses: 'Địa chỉ',
          address: 'Địa chỉ',
          variantsCollectionDescription:
            'Biến thể sản phẩm cho phép bạn cung cấp các phiên bản khác nhau của sản phẩm, chẳng hạn như biến thể kích thước hoặc màu sắc.',
          inventory: 'Kho hàng',
          variants: 'Biến thể',
          variant: 'Biến thể',
          variantTypes: 'Loại biến thể',
          variantType: 'Loại biến thể',
          variantOptions: 'Tùy chọn biến thể',
          variantOption: 'Tùy chọn biến thể',
          enableVariants: 'Bật biến thể',
          availableVariants: 'Biến thể có sẵn',
          cartsCollectionDescription:
            'Giỏ hàng đại diện cho việc chọn sản phẩm mà khách hàng dự định mua.',
          items: 'Các mục',
          item: 'Mục',
          product: 'Sản phẩm',
          quantity: 'Số lượng',
          cartSecret: 'Mã bí mật giỏ hàng',
          purchasedAt: 'Ngày mua',
          status: 'Trạng thái',
          active: 'Hoạt động',
          purchased: 'Đã mua',
          abandoned: 'Bị bỏ',
          subtotal: 'Tổng phụ',
          currency: 'Tiền tệ',
          ordersCollectionDescription: 'Đơn hàng đại diện cho ý định mua hàng của khách hàng.',
          orderDetails: 'Chi tiết đơn hàng',
          shippingAddress: 'Địa chỉ giao hàng',
          shipping: 'Vận chuyển',
          customerEmail: 'Email khách hàng',
          transactions: 'Giao dịch',
          processing: 'Đang xử lý',
          completed: 'Hoàn thành',
          cancelled: 'Đã hủy',
          refunded: 'Đã hoàn tiền',
          amount: 'Số tiền',
          transactionsCollectionDescription:
            'Giao dịch đại diện cho các lần thanh toán cho đơn hàng.',
          transactionDetails: 'Chi tiết giao dịch',
          billingAddress: 'Địa chỉ thanh toán',
          billing: 'Thanh toán',
          pending: 'Đang chờ',
          succeeded: 'Thành công',
          failed: 'Thất bại',
          expired: 'Hết hạn',
          order: 'Đơn hàng',
        },
        'plugin-redirects': {
          fromUrl: 'Từ URL',
          toUrlType: 'Loại URL đến',
          internalLink: 'Liên kết nội bộ',
          customUrl: 'URL tùy chỉnh',
          documentToRedirect: 'Tài liệu để chuyển hướng',
        },
      },
    },
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  collections: [Pages, Posts, Media, Categories, Users, Branches, Rooms, Bookings, Testimonials],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, SiteSettings],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
