'use client'
import React, { useCallback, useState } from 'react'
import { useForm, FormProvider, UseFormReturn } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Mail, Phone, MapPin } from 'lucide-react'

import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import { getClientSideURL } from '@/utilities/getURL'
import { fields } from '../Form/fields'
import type { ContactBlock as ContactBlockType, Form as FormType, SiteSetting } from '@/payload-types'

export const ContactBlock: React.FC<ContactBlockType & { id?: string; siteSettings?: SiteSetting | null }> = (props) => {
    const {
        title,
        description,
        form,
        contactInfo: {
            showContactInfo,
            overrideContactInfo,
            phone: customPhone,
            email: customEmail,
            address: customAddress,
        } = {},
        siteSettings,
    } = props

    const displayPhone = overrideContactInfo ? customPhone : (siteSettings?.contact?.hotline || customPhone || '0123 456 789')
    const displayEmail = overrideContactInfo ? customEmail : (siteSettings?.contact?.email || customEmail || 'contact@cloud9hotel.com')
    const displayAddress = overrideContactInfo ? customAddress : (siteSettings?.contact?.address || customAddress || '123 Đường ABC, Quận XYZ,\nTP. Hồ Chí Minh')

    const {
        id: formID,
        confirmationMessage,
        confirmationType,
        redirect,
        submitButtonLabel,
        fields: formFields,
    } = (form as FormType) || {}

    const formMethods = useForm()
    const {
        control,
        formState: { errors },
        handleSubmit,
        register,
    } = formMethods as UseFormReturn<any>

    const [isLoading, setIsLoading] = useState(false)
    const [hasSubmitted, setHasSubmitted] = useState<boolean>()
    const [error, setError] = useState<{ message: string; status?: string } | undefined>()
    const router = useRouter()

    const onSubmit = useCallback(
        (data: any) => {
            let loadingTimerID: ReturnType<typeof setTimeout>
            const submitForm = async () => {
                setError(undefined)

                const dataToSend = Object.entries(data).map(([name, value]) => ({
                    field: name,
                    value,
                }))

                loadingTimerID = setTimeout(() => {
                    setIsLoading(true)
                }, 1000)

                try {
                    const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
                        body: JSON.stringify({
                            form: formID,
                            submissionData: dataToSend,
                        }),
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        method: 'POST',
                    })

                    const res = await req.json()

                    if (loadingTimerID) clearTimeout(loadingTimerID)

                    if (req.status >= 400) {
                        setIsLoading(false)
                        setError({
                            message: res.errors?.[0]?.message || 'Internal Server Error',
                            status: res.status,
                        })
                        return
                    }

                    setIsLoading(false)
                    setHasSubmitted(true)

                    if (confirmationType === 'redirect' && redirect) {
                        const { url } = redirect
                        if (url) router.push(url)
                    }
                } catch (err) {
                    console.warn(err)
                    setIsLoading(false)
                    setError({
                        message: 'Something went wrong.',
                    })
                }
            }

            void submitForm()
        },
        [router, formID, redirect, confirmationType],
    )

    return (
        <div className="container py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                {/* Left Column: Info */}
                <div className="flex flex-col gap-10">
                    <div className="flex flex-col gap-6">
                        <h2 className="text-5xl font-serif font-medium tracking-tight text-foreground lg:text-6xl leading-tight">
                            {title}
                        </h2>
                        <div className="h-1 w-24 bg-primary" />
                        {description && (
                            <div className="prose prose-lg dark:prose-invert mt-4 max-w-xl text-muted-foreground font-light leading-relaxed">
                                <RichText data={description as any} enableGutter={false} />
                            </div>
                        )}
                    </div>

                    {showContactInfo && (
                        <div className="flex flex-col gap-8 mt-2">
                            {(displayPhone) && (
                                <div className="flex items-center gap-6 group">
                                    <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-accent text-primary border border-primary/20 transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-1">Hotline</span>
                                        <p className="text-xl font-medium tracking-wide">{displayPhone}</p>
                                    </div>
                                </div>
                            )}

                            {(displayEmail) && (
                                <div className="flex items-center gap-6 group">
                                    <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-accent text-primary border border-primary/20 transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-1">Email</span>
                                        <p className="text-xl font-medium tracking-wide">{displayEmail}</p>
                                    </div>
                                </div>
                            )}

                            {(displayAddress) && (
                                <div className="flex items-start gap-6 group">
                                    <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-accent text-primary border border-primary/20 transition-all duration-300 group-hover:bg-primary group-hover:text-white mt-1">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-1">Địa chỉ</span>
                                        <p className="text-xl font-medium tracking-wide leading-relaxed whitespace-pre-line">
                                            {displayAddress}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column: Form */}
                <div className="relative">
                    {/* Decorative background element for luxury feel */}
                    <div className="absolute inset-0 border border-primary/10 -z-10 translate-x-4 translate-y-4" />

                    <div className="bg-background p-8 lg:p-12 border border-border shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.05)]">
                        <h3 className="text-2xl font-serif font-medium mb-8 text-foreground">Liên hệ với chúng tôi</h3>
                        <FormProvider {...formMethods}>
                            {!isLoading && hasSubmitted && confirmationType === 'message' && confirmationMessage && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-10">
                                    <RichText data={confirmationMessage as any} />
                                </div>
                            )}
                            {isLoading && !hasSubmitted && (
                                <div className="flex flex-col items-center justify-center py-20 gap-6">
                                    <div className="w-16 h-16 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    <p className="text-primary font-medium tracking-widest uppercase text-sm animate-pulse">Đang gửi thông tin...</p>
                                </div>
                            )}
                            {error && (
                                <div className="p-4 mb-8 text-destructive bg-destructive/5 border border-destructive/10 text-sm font-medium">
                                    {`${error.status || '500'}: ${error.message || ''}`}
                                </div>
                            )}
                            {!hasSubmitted && !isLoading && (
                                <form id={formID} onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                    <div className="grid grid-cols-1 gap-8">
                                        {formFields?.map((field, index) => {
                                            const Field = fields[field.blockType as keyof typeof fields] as React.FC<any>
                                            if (Field) {
                                                return (
                                                    <div key={index} className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                                                        <Field
                                                            form={form as FormType}
                                                            {...field}
                                                            {...formMethods}
                                                            control={control}
                                                            errors={errors}
                                                            register={register}
                                                        />
                                                    </div>
                                                )
                                            }
                                            return null
                                        })}
                                    </div>

                                    <Button
                                        form={formID}
                                        type="submit"
                                        variant="default"
                                        className="w-full py-8 text-sm font-bold uppercase tracking-[0.3em] bg-primary hover:bg-primary/90 text-white rounded-none transition-all duration-300 shadow-xl shadow-primary/10"
                                    >
                                        {submitButtonLabel || 'Gửi tin nhắn'}
                                    </Button>
                                </form>
                            )}
                        </FormProvider>
                    </div>
                </div>
            </div>
        </div>
    )
}
