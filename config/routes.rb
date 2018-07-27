Rails.application.routes.draw do
  get  'map/home'
  post 'map/home'
  get  'map/static_page'

  root 'top#index'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

end
