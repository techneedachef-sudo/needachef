"use client";

import { Container, Title, Text, Grid, Button, Image, Badge, Rating, Textarea, Paper, Loader, Alert, Box, Anchor } from "@mantine/core";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/components/cart/CartContext";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Review {
    userId: string;
    rating: number;
    comment: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image?: string;
    reviews: Review[];
}

interface CartItem extends Product {
    quantity: number;
}

export default function ProductDetailPage() {
    const params = useParams();
    const productId = params.id as string;
    const { user } = useAuth();
    const { dispatch } = useCart();
    
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviewError, setReviewError] = useState('');

    const fetchProduct = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(`/api/products/${productId}`);
            if (!res.ok) throw new Error("Product not found.");
            const data = await res.json();
            setProduct(data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        if (productId) {
            fetchProduct();
        }
    }, [productId, fetchProduct]);

    const handleAddToCart = () => {
        if (!product) return;
        const cartItem: CartItem = { ...product, quantity: 1 };
        dispatch({ type: 'ADD_ITEM', payload: cartItem });
        notifications.show({
            title: `${product.name} added`,
            message: "Item has been added to your cart.",
            color: 'teal',
            icon: <IconCheck size={18} />,
        });
    };

    const handleReviewSubmit = async () => {
        if (rating === 0 || comment.trim() === '') {
            setReviewError("Please provide a rating and a comment.");
            return;
        }
        setReviewError('');

        try {
            const response = await fetch(`/api/products/${productId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, comment }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to submit review.");
            }

            setRating(0);
            setComment('');
            notifications.show({
                title: "Review Submitted",
                message: "Thank you for your feedback!",
                color: 'green',
            });
            fetchProduct(); // Refresh reviews
        } catch (err) {
            if (err instanceof Error) {
                setReviewError(err.message);
            } else {
                setReviewError("An unknown error occurred.");
            }
        }
    };

    if (loading) return <Container my="xl"><Loader /></Container>;
    if (error) return <Container my="xl"><Alert color="red" title="Error">{error}</Alert></Container>;
    if (!product) return null;

    return (
        <>
            <Header />
            <Container size="lg" my="xl">
                <Grid gutter="xl">
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Image src={product.image || "https://placehold.co/600x400?text=Product+Image"} alt={product.name} radius="md" />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Badge>{product.category}</Badge>
                        <Title order={1} mt="sm">{product.name}</Title>
                        <Text size="2rem" fw={700} mt="md">${(product.price / 100).toFixed(2)}</Text>
                        <Button size="lg" mt="xl" onClick={handleAddToCart}>Add to Cart</Button>
                    </Grid.Col>
                </Grid>

                <Paper withBorder p="xl" mt="xl" radius="md">
                    <Title order={3}>Reviews</Title>
                    {product.reviews.length > 0 ? (
                        product.reviews.map((review, index) => (
                            <Box key={index} mt="md" pb="md" style={{ borderBottom: '1px solid #e9ecef' }}>
                                <Rating value={review.rating} readOnly />
                                <Text mt="xs">{review.comment}</Text>
                                <Text size="xs" c="dimmed">by User {review.userId.slice(0, 4)}</Text>
                            </Box>
                        ))
                    ) : (
                        <Text mt="md">No reviews yet. Be the first to leave one!</Text>
                    )}
                    
                    {user ? (
                        <Box mt="xl">
                            <Title order={4}>Leave a Review</Title>
                            <Rating value={rating} onChange={setRating} size="lg" mt="sm" />
                            <Textarea
                                placeholder="Your comment"
                                value={comment}
                                onChange={(event) => setComment(event.currentTarget.value)}
                                mt="sm"
                                error={reviewError}
                            />
                            <Button onClick={handleReviewSubmit} mt="md">Submit Review</Button>
                        </Box>
                    ) : (
                        <Text mt="xl">You must be <Anchor component={Link} href="/login">logged in</Anchor> to leave a review.</Text>
                    )}
                </Paper>
            </Container>
            <Footer />
        </>
    );
}

