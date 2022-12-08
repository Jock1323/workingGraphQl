import { ApolloServer, gql } from "apollo-server";
import { categories } from "./categories.js"
import { products } from "./products.js"
import { subCategories } from "./subCategories.js"
let users = [
  { user_id: 1, name: "mirsidiq" },
  { user_id: 2, name: "asliddin" },
  { user_id: 3, name: "akrom" },
]
const scheme = gql`
type Query{
  users:[User]
  categories:[Categories]
  subCategories:[subCategories]
  products:[Products],
  productsById(productId:Int!):Products,
  productsBySubcategory(subCategoryId:Int!):[Products],
  productsByModel(model:String!):[Products],
  productsBySubcategoryAndModel(subCategoryId:Int!,model:String!):[Products],
  productsByCategoryId(categoryId:Int!):[Products]
}
type User{
  user_id:Int
  name:String
}
type Categories{
  categoryId:Int!
  categoryName:String
}
type subCategories{
  subCategoryId:Int!
  subCategoryName:String
  category:String
}
type Products{
  productId:Int!
  subCategory:String,
  subCategoryId:Int!
  model:String
  productName:String
  color:String
  price:String
}
`;
const resolver = {
  Query: {
    users: () => users,
    categories: () => categories,
    subCategories: () => subCategories,
    products: () => products,
    productsById: (_, { productId }) => products.find(product => product.productId == productId),
    productsBySubcategory: (_, { subCategoryId }) => products.filter(product => product.subCategoryId == subCategoryId),
    productsByModel: (_, { model }) => products.filter(product => product.model.toLocaleLowerCase().includes(model.toLocaleLowerCase())),
    productsBySubcategoryAndModel: (_, { subCategoryId, model }) => {
      return products.filter(product => product.subCategoryId == subCategoryId && product.model.toLocaleLowerCase().includes(model.toLocaleLowerCase()))
    },
    productsByCategoryId: (_, { categoryId }) => {
      const foundedSubCategory = subCategories.filter(subcategory => subcategory.categoryId == categoryId)
      const foundedProducts = products.filter(product => {
        for (let item of foundedSubCategory) {
          if (item.subCategoryId == product.subCategoryId) {
            return product
          }
        }
      })
      return foundedProducts
    }
  },
  subCategories: {
    category: (parent) => {
      let category = categories.find(category => category.categoryId == parent.categoryId)
      return category.categoryName
    }
  },
  Products: {
    subCategory: (parent) => {
      let subCategory = subCategories.find(subCategory => subCategory.subCategoryId == parent.subCategoryId)
      return subCategory.subCategoryName
    }
  }
}
const server = new ApolloServer({ typeDefs: scheme, resolvers: resolver })
server.listen().then(({ url }) => console.log(url))