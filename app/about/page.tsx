import Head from 'next/head'

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About Us - Swift Spark Store</title>
        <meta name="description" content="Learn more about Swift Spark Store" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              About Swift Spark Store
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Your trusted destination for premium products
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Swift Spark Store was founded with a simple mission: to bring you the best products 
                at the most competitive prices. We curate a carefully selected collection of premium 
                items across fashion, health & fitness, digital products, and beauty.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Our team works tirelessly to find amazing deals and exclusive offers, ensuring that 
                you get exceptional value for your money. Whether you're looking for trendy fashion 
                pieces, health supplements, digital resources, or beauty essentials, we've got you covered.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                We believe that everyone deserves access to quality products without breaking the bank. 
                That's why we've built Swift Spark Store - to make premium products accessible to everyone.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Curated Selection
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Every product is carefully selected for quality and value
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Best Prices
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We find the best deals so you don't have to
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Fast Delivery
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Quick and reliable shipping to your doorstep
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export async function getStaticProps() {
  return {
    props: {},
  }
}