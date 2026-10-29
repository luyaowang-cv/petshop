import { Button } from "@/components/ui/Button";
import { CurrencyInput } from "@/components/ui/Form/Inputs/CurrencyInput";
import { Input } from "@/components/ui/Form/Inputs/Input";
import { TextArea } from "@/components/ui/Form/TextArea";
import { zodResolver } from "@hookform/resolvers/zod";
import { convertCentsToReais, maskNumberToCurrency, parseMaskedCurrencyValueToNumber } from "@/utils/currency";
import { parseTimeStringToDuration, parseSecondsToTimeDurationString } from "@/utils/timeDuration";
import { SubmitHandler, useForm } from "react-hook-form";
import { PetshopServiceBodyData, PetshopService } from "src/@types/PetshopServices";
import { useQuery } from "@tanstack/react-query";
import { fetchServiceCategories, SERVICECATEGORY_KEY } from "@/services/queries/ServiceCategories";
import { z } from "zod";

const petshopServiceSchema = z.object({
  categoryId: z.string().min(1, "Selecione a categoria do serviço"),
  title: z.string().min(1, "O título é obrigatório").max(60, "Tamanho máximo do título é de 60 caracteres"),
  description: z
    .string()
    .min(1, "A descrição é obrigatória")
    .max(120, "Tamanho máximo da descrição é de 120 caracteres"),
  value: z
    .string()
    .nonempty({
      message: "O valor é obrigatório",
    })
    // CurrencyInput masks the currency value, so we need to transform that string value into
    // a number for better validation
    .transform((value) => parseMaskedCurrencyValueToNumber(value))
    .pipe(z.number().min(0.01, "Valor mínimo é de 1 centavo").max(1_000_000, "Valor máximo é de R$1.000.000"))
    .transform((value) => maskNumberToCurrency(value)), // transform back to string to use it as a string
  duration: z
    .string()
    .length(8, "O tempo é obrigatório")
    // parses time string into seconds for validation
    .transform((value) => {
      const timeDuration = parseTimeStringToDuration(value);
      return timeDuration.asSeconds();
    })
    .pipe(z.number().min(1, "Valor mínimo é de 1s"))
    .transform((value) => {
      // transform back to time string (HH:mm:ss) to use it as a string
      return parseSecondsToTimeDurationString(value);
    }),
});

export type PetshopServiceFormData = z.infer<typeof petshopServiceSchema>;

interface Props {
  service?: PetshopService;
  onSubmit: (d: PetshopServiceBodyData) => Promise<void>;
  isLoading: boolean;
}
export function ServiceForm(props: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PetshopServiceFormData>({
    resolver: zodResolver(petshopServiceSchema),
    defaultValues: {
      categoryId: props.service?.categoryId ?? "",
      title: props.service?.title ?? "",
      description: props.service?.description ?? "",
      value: props.service ? maskNumberToCurrency(convertCentsToReais(props.service?.value)) : "0,00",
      duration: parseSecondsToTimeDurationString(props.service?.duration ?? 3600),
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: [SERVICECATEGORY_KEY],
    queryFn: fetchServiceCategories,
  });
  const categories = categoriesData?.categories ?? [];

  const getSubmitButtonText = () => (props.service ? "Editar" : "Criar");

  const handleFormSubmit: SubmitHandler<PetshopServiceFormData> = async (data) => {
    const timeDuration = parseTimeStringToDuration(data.duration);

    props.onSubmit({
      ...data,
      value: parseMaskedCurrencyValueToNumber(data.value),
      duration: timeDuration.asSeconds(),
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full max-w-2xl mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
        <div className="flex flex-col gap-2">
          <fieldset>
            <label htmlFor="categoryId" className="block text-sm mb-1">
              Categoria
            </label>
            <select
              id="categoryId"
              className="w-full border rounded px-3 py-2"
              {...register("categoryId")}
            >
              <option value="">Selecione a categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon ? `${category.icon} ` : ""}
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId?.message ? (
              <span className="text-red-500 text-sm">
                {errors.categoryId.message}
              </span>
            ) : null}
          </fieldset>

          <fieldset>
            <Input label="Título" id="title" errorMessage={errors.title?.message} {...register("title")} />
          </fieldset>

          <fieldset>
            <TextArea
              label="Descrição"
              id="description"
              errorMessage={errors.description?.message}
              {...register("description")}
            />
          </fieldset>
        </div>

        <div className="flex flex-col gap-2">
          <fieldset>
            <Input
              label="Duração"
              type="time"
              step={1} // required to render seconds as well
              id="duration"
              errorMessage={errors.duration?.message}
              {...register("duration")}
            />
          </fieldset>
          <fieldset>
            <CurrencyInput label="Valor" id="value" errorMessage={errors.value?.message} {...register("value")} />
          </fieldset>
        </div>
      </div>

      <div className="mt-4">
        <Button type="submit" bg="submit" isLoading={props.isLoading}>
          {getSubmitButtonText()}
        </Button>
      </div>
    </form>
  );
}
