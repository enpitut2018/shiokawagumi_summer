Rails.application.routes.draw do
    # get  'map/home'
    # post 'map/home'
  get  'top/index'
  post 'top/index'
  get  'map/static_page'

  root 'map#home'
  # root 'top#index'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

end
